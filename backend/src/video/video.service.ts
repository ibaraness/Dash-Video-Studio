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

    async streamVideo(res: Response, headers: { range: string }, videoId: string, userId: string, resolution?: string): Promise<void> {
        let { fallbackVideoPath: videoPath } = await this.loadvideo(videoId, userId);

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

    async saveVideo(videoPath: string, videoInfo: VideoBasicInfo, userId: string, imagePath?: string) {
        const metadata = JSON.stringify(videoInfo);
        const filename = path.parse(videoPath).name
        const video = this.videoRepository.create({ metadata, name: filename, thumbnail: imagePath, userId });
        const saved = await this.videoRepository.save(video);
        await this.cacheManager.del("allVideos");
        await this.cacheManager.set(String(saved.id), JSON.stringify(saved));
        return saved
    }

    async clear() {
        await this.videoRepository.clear();
        await this.cacheManager.reset();
    }

    async clearCache(){
        await this.cacheManager.reset();
    }

    async loadvideo(id: string, userId: string): Promise<Video> {
        const cached: string = await this.cacheManager.get(`${id}-${userId}`);
        if (cached) {
            return JSON.parse(cached);
        }
        const video = await this.videoRepository.findOne({ where: { id, userId } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        await this.cacheManager.set(`${id}-${userId}`, JSON.stringify(video));
        return video;
    }

    async getPublicVideoById(id: string,  userId: string): Promise<VideoPublic> {
        const cached: string = await this.cacheManager.get(`getById${id}-${userId}`);
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
        await this.cacheManager.set(`getById${id}-${userId}`, JSON.stringify(videoPublic));
        await this.cacheManager.set(`${id}-${userId}`, JSON.stringify(video));
        await this.cacheManager.del(`allVideos(${userId})`);
        return videoPublic;
    }

    async getAll(userId: string) {
        const cachedResults: string = await this.cacheManager.get(`allVideos(${userId})`);
        if (cachedResults) {
            return JSON.parse(cachedResults);
        }

        const videos = await this.videoRepository.find({
            where:{userId},
            order: { "lastChangedDateTime": "DESC" }
        });
        if (!videos || !videos.length) {
            this.logger.debug(`Videos not found!`, VideoService.name);
            return [];
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

        await this.cacheManager.set(`allVideos(${userId})`, JSON.stringify(allVideos));

        return allVideos;
    }

    getPublicURL(localPath?: string) {
        if (!localPath) {
            return localPath;
        }
        const localSegment = path.join(__dirname, '../../');
        return localPath.replace(localSegment, '');
    }

    async deleteVideo(id: string, userId: string) {
        const video = await this.videoRepository.findOne({ where: { id, userId } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        const deletedVideo = await this.videoRepository.delete(id)
        await this.cacheManager.del(`allVideos(${userId})`);
        await this.cacheManager.del(`getById${id}-${userId}`);
        await this.cacheManager.del(`${id}-${userId}`);
        return deletedVideo;
    }

    async updateTrascodeData(id: string, size: string, videoPath: string, userId: string) {
        const video = await this.videoRepository.findOne({ where: { id, userId } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }

        const saved = await this.videoRepository.save(video);
        await this.cacheManager.del(`allVideos(${userId})`);
        await this.cacheManager.del(`getById${id}-${userId}`);
        await this.cacheManager.set(`${id}-${userId}`, JSON.stringify(saved));
        return saved;
    }

    async updateBucketData(id: string, bucket: string, fileId: UUID, userId: string) {
        const video = await this.videoRepository.findOne({ where: { id, userId } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        video.bucket = bucket;
        video.fileId = fileId;
        const saved = await this.videoRepository.save(video);
        await this.cacheManager.del(`allVideos(${userId})`);
        await this.cacheManager.del(`getById${id}-${userId}`);
        await this.cacheManager.set(`${id}-${userId}`, JSON.stringify(saved));
        return saved;
    }

    async updateDashData(id: string, dashFilePath: string, fallbackFile: string, userId: string) {
        const video = await this.videoRepository.findOne({ where: { id, userId } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        video.dashFilePath = dashFilePath;
        video.fallbackVideoPath = fallbackFile;
        const saved = await this.videoRepository.save(video);
        await this.cacheManager.del(`allVideos(${userId})`);
        await this.cacheManager.del(`getById${id}-${userId}`);
        await this.cacheManager.set(`${id}-${userId}`, JSON.stringify(saved));
        return saved;
    }

    async updateNameAndDescription(id: string, name: string, description: string, userId: string) {
        const video = await this.videoRepository.findOne({ where: { id, userId } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        video.name = name;
        video.description = description;
        const saved = await this.videoRepository.save(video);
        await this.cacheManager.del(`allVideos(${userId})`);
        await this.cacheManager.del(`getById${id}-${userId}`);
        await this.cacheManager.set(`${id}-${userId}`, JSON.stringify(saved));
        return saved;
    }
}
