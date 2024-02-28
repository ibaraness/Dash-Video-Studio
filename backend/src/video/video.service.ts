import { HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { promisify } from "util";
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from "path";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Video } from "./video.entity";
import fs = require("fs");
import { createReadStream } from "fs";
import { Response } from 'express';
import { VideoBasicInfo, VideoPublic } from "./video.model";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import * as sharp from "sharp";
import { Config } from "src/config/app.config";
import { LoggerService } from "src/logger/logger.service";
import { UUID } from "crypto";

const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export const ffprobeAsync = promisify<string, ffmpeg.FfprobeData>(ffmpeg.ffprobe);

@Injectable()
export class VideoService {

    constructor(
        @InjectRepository(Video) private readonly videoRepository: Repository<Video>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private logger: LoggerService
    ) { }

    async getVideoBasicInfo(videoPath: string): Promise<VideoBasicInfo> {
        try {
            const metadata = await ffprobeAsync(videoPath);
            const filename = path.parse(videoPath).name
            const duration = metadata.format.duration && metadata.format.duration;
            const bitRate = Number(metadata.streams[0].bit_rate || 0);
            const size = Number(metadata.format.size || 0);
            const width = metadata.streams[0].width;
            const height = metadata.streams[0].height;
            const codecName = metadata.streams[0].codec_name;
            const codecType = metadata.streams[0].codec_long_name;
            const frameRate = metadata.streams[0].r_frame_rate;
            const frames = Number(metadata.streams[0].nb_frames || 0);
            const info = { filename, duration, bitRate, size, width, height, codecName, codecType, frames, frameRate }
            return info
        } catch (e) {
            this.logger.error("Error in getVideoBasicInfo", e, VideoService.name);
            throw Error("Unknown problem with getting Video Metadata")
        }
    }

    async getVideoInfo(videoPath: string): Promise<ffmpeg.FfprobeData> {
        const metadata = await ffprobeAsync(videoPath);
        return metadata;
    }

    async streamVideo(res: Response, headers: { range: string }, videoId: number, resolution?: string): Promise<void> {
        let { fallbackVideoPath: videoPath } = await this.loadvideo(videoId);

        // Add check if exist
        const { size } = fs.statSync(videoPath);

        const videoRange = headers.range;
        if (videoRange) {
            const parts = videoRange.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
            const chunksize = (end - start) + 1;
            const readStreamfile = createReadStream(videoPath, { start, end, highWaterMark: 60 });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${size}`,
                'Content-Length': chunksize,
            };
            res.writeHead(HttpStatus.PARTIAL_CONTENT, head); //206
            readStreamfile.pipe(res);
        } else {
            const head = {
                'Content-Length': size,
            };
            res.writeHead(HttpStatus.OK, head);//200
            createReadStream(videoPath).pipe(res);
        }
    }

    private async generateVideoScfreenshot(videoPath: string, imageFilename: string, imagePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg()
                // Input file
                .input(videoPath)

                .screenshot({
                    filename: imageFilename,
                    timemarks: ['0'],
                    folder: imagePath,
                })
                .on('end', () => {
                    resolve(path.join(imagePath, imageFilename));
                })
                .on('error', (error) => {
                    reject(error);
                })
        });
    }

    async getVideoScreenShot(videoPath: string): Promise<string> {

        if (!fs.existsSync(videoPath)) {
            throw new NotFoundException("Video not found on that path");
        }

        const imagePath = path.join(path.dirname(videoPath), "../", "screenshots");

        const thumbWidth = Config.upload.screnshots.width;
        const thumbHeight = Config.upload.screnshots.height;

        // Temporary image created by ffmpeg 
        const ffmpegFilname = "temp_thumb.jpg";

        // To be used by sharp to resize and crop the final thumb image
        const finalFilePath = path.join(imagePath, "thumb.jpg");

        if (!fs.existsSync(imagePath)) {
            fs.mkdirSync(imagePath, { recursive: true });
        }

        // Grab a screenshot from the video
        const ffmpegScreeshotPath = await this.generateVideoScfreenshot(videoPath, ffmpegFilname, imagePath);

        // Resize and crop the screenshot image to a unified size
        const imageResizer = async (inputImagePath: string, fileOutputPath: string, width: number, height: number) => {
            await sharp(inputImagePath)
                .jpeg().resize(width, height)
                .toFile(fileOutputPath);
            return fileOutputPath;
        }

        // Set the size of the thumnails in app config
        return imageResizer(ffmpegScreeshotPath, finalFilePath, thumbWidth, thumbHeight);
    }

    async saveVideo(videoPath: string, videoInfo: VideoBasicInfo, imagePath?: string) {
        const metadata = JSON.stringify(videoInfo);
        const filename = path.parse(videoPath).name
        const video = this.videoRepository.create({ metadata, name: filename, thumbnail: imagePath });
        const saved = await this.videoRepository.save(video);
        await this.cacheManager.del("allVideos");
        await this.cacheManager.set(String(saved.id), JSON.stringify(saved));
        return saved
    }

    async clear() {
        await this.videoRepository.clear();
        await this.cacheManager.reset();
    }

    async loadvideo(id: number): Promise<Video> {
        const cached: string = await this.cacheManager.get(String(id));
        if (cached) {
            return JSON.parse(cached);
        }
        const video = await this.videoRepository.findOne({ where: { id } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        await this.cacheManager.set(String(id), JSON.stringify(video));
        return video;
    }

    async getById(id: number): Promise<VideoPublic> {
        const cached: string = await this.cacheManager.get(`getById${id}`);
        if (cached) {
            return JSON.parse(cached);
        }
        const video = await this.videoRepository.findOne({ where: { id } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        const { dashFilePath, thumbnail, fallbackVideoPath, ...rest } = video;
        const videoPublic = {
            ...rest,
            fallbackVideoPath: this.getPublicURL(fallbackVideoPath),
            thumbnail: this.getPublicURL(thumbnail),
            dash: this.getPublicURL(dashFilePath),
            metadata: JSON.parse(rest.metadata)
        }
        await this.cacheManager.set(`getById${id}`, JSON.stringify(videoPublic));
        await this.cacheManager.set(String(id), JSON.stringify(video));
        await this.cacheManager.del("allVideos");
        return videoPublic;
    }

    async getAll() {
        const cachedResults: string = await this.cacheManager.get("allVideos");
        if (cachedResults) {
            return JSON.parse(cachedResults);
        }

        const videos = await this.videoRepository.find({
            order: { "lastChangedDateTime": "DESC" }
        });
        if (!videos || !videos.length) {
            throw new NotFoundException(`Videos not found!`);
        }

        const allVideos = videos.map(({ dashFilePath, thumbnail, fallbackVideoPath, ...rest }) => {
            return {
                ...rest,
                fallbackVideoPath: this.getPublicURL(fallbackVideoPath),
                thumbnail: this.getPublicURL(thumbnail),
                dash: this.getPublicURL(dashFilePath),
                metadata: JSON.parse(rest.metadata)
            }
        });

        await this.cacheManager.set("allVideos", JSON.stringify(allVideos));

        return allVideos;
    }

    getPublicURL(localPath?: string) {
        if (!localPath) {
            return localPath;
        }
        const localSegment = path.join(__dirname, '../../');
        return localPath.replace(localSegment, '');
    }

    async deleteVideo(id: number) {
        const video = await this.videoRepository.findOne({ where: { id } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        const deletedVideo = await this.videoRepository.delete(id)
        await this.cacheManager.del("allVideos");
        await this.cacheManager.del(`getById${id}`);
        await this.cacheManager.del(String(id));
        return deletedVideo;
    }

    async updateTrascodeData(id: number, size: string, videoPath: string) {
        const video = await this.videoRepository.findOne({ where: { id } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }

        const saved = await this.videoRepository.save(video);
        await this.cacheManager.del("allVideos");
        await this.cacheManager.del(`getById${id}`);
        await this.cacheManager.set(String(id), JSON.stringify(saved));
        return saved;
    }

    async updateBucketData(id: number, bucket: string, fileId: UUID) {
        const video = await this.videoRepository.findOne({ where: { id } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        video.bucket = bucket;
        video.fileId = fileId;
        const saved = await this.videoRepository.save(video);
        await this.cacheManager.del("allVideos");
        await this.cacheManager.del(`getById${id}`);
        await this.cacheManager.set(String(id), JSON.stringify(saved));
        return saved;
    }

    async updateDashData(id: number, dashFilePath: string, fallbackFile: string) {
        const video = await this.videoRepository.findOne({ where: { id } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        video.dashFilePath = dashFilePath;
        video.fallbackVideoPath = fallbackFile;
        const saved = await this.videoRepository.save(video);
        await this.cacheManager.del("allVideos");
        await this.cacheManager.del(`getById${id}`);
        await this.cacheManager.set(String(id), JSON.stringify(saved));
        return saved;
    }

    async updateNameAndDescription(id: number, name: string, description: string) {
        const video = await this.videoRepository.findOne({ where: { id } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        video.name = name;
        video.description = description;
        const saved = await this.videoRepository.save(video);
        await this.cacheManager.del("allVideos");
        await this.cacheManager.del(`getById${id}`);
        await this.cacheManager.set(String(id), JSON.stringify(saved));
        return saved;
    }
}
