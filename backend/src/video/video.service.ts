import { Injectable, NotFoundException } from "@nestjs/common";
import * as ffprobeStatic from 'ffprobe-static';
import ffmpegStatic from 'ffmpeg-static';
import { promisify } from "util";
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from "path";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Video } from "./video.entity";
import fs = require("fs");
const sharp = require("sharp");

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export const ffprobeAsync = promisify<string, ffmpeg.FfprobeData>(ffmpeg.ffprobe);

export interface VideoBasicInfo {
    filename: string;
    duration: number;
    bitRate: number;
    size: number;
    width: number;
    height: number;
    codecName: string;
    codecType: string;
    frames: number;
}

@Injectable()
export class VideoService {

    constructor(@InjectRepository(Video)
    private readonly videoRepository: Repository<Video>) { }

    async getVideoBasicInfo(videoPath: string): Promise<VideoBasicInfo> {
        const metadata = await ffprobeAsync(videoPath);
        const filename = path.parse(videoPath).name
        // console.log(metadata)
        const duration = metadata.format.duration && metadata.format.duration;
        const bitRate = Number(metadata.streams[0].bit_rate || 0);
        const size = Number(metadata.format.size || 0);
        const width = metadata.streams[0].width;
        const height = metadata.streams[0].height;
        const codecName = metadata.streams[0].codec_name;
        const codecType = metadata.streams[0].codec_long_name;
        // const filename = metadata.format.filename;
        const frames = Number(metadata.streams[0].nb_frames || 0);
        const info = { filename, duration, bitRate, size, width, height, codecName, codecType, frames }
        return info
    }

    async saveVideoScreenShot(videoPath: string): Promise<string> {
        const ffmpegStatic = require('ffmpeg-static');
        ffmpeg.setFfmpegPath(ffmpegStatic);
        if (!fs.existsSync(videoPath)) {
            console.log("video file not exist");
            return;
        }

        const dirname = path.basename(videoPath).replace(/\..*/, '_');
        const imagePath = path.join(path.dirname(videoPath), dirname, "screenshots");
        const filname = "thumb.jpg";

        if (!fs.existsSync(imagePath)) {
            fs.mkdirSync(imagePath, { recursive: true });
        }
        return new Promise((resolve, reject) => {
            ffmpeg()
                // Input file
                .input(videoPath)

                .screenshot({
                    filename: filname,
                    timemarks: ['0'],
                    folder: imagePath,
                    size: "1280x720"
                })
                .on('end', () => {
                    console.log("image was saved!", `${imagePath}/${filname}`)
                    resolve(`${imagePath}/${filname}`)
                })
                .on('error', (error) => {
                    console.log(error);
                    reject(error);
                })

        })
    }

    async saveVideo(videoPath: string, videoInfo: VideoBasicInfo, imagePath?: string) {
        const metadata = JSON.stringify(videoInfo);
        const filename = path.parse(videoPath).name
        const video = this.videoRepository.create({ metadata, name: filename, path: videoPath, thumbnail: imagePath });
        return await this.videoRepository.save(video);
    }

    async clear() {
        await this.videoRepository.clear();
    }

    async loadvideo(id: number) {
        const video = await this.videoRepository.findOne({ where: { id } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        return video;
    }

    async getAll() {
        const videos = await this.videoRepository.find();
        if (!videos || !videos.length) {
            throw new NotFoundException(`Videos not found!`);
        }
        return videos.map(({ path, transcode, ...rest }) => {
            const transcodeObject = JSON.parse(transcode) || {};
            return {
                ...rest,
                thumbnail:`/video/image/${rest.id}`,
                metadata: JSON.parse(rest.metadata),
                transcodeSizes: Object.keys(transcodeObject)
            }
        });
    }

    async updateTrascodeData(id: number, size: string, videoPath: string) {
        const video = await this.videoRepository.findOne({ where: { id } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }
        const transcodeData = JSON.parse(video.transcode) || {};
        video.transcode = JSON.stringify({ ...transcodeData, [size]: videoPath });
        return await this.videoRepository.save(video);
    }
}
