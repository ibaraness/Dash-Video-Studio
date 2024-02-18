import {
    Body,
    Controller,
    Get,
    Header, Param,
    Post, Res, UploadedFile,
    UseInterceptors,
    Headers
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { VideoService } from "./video.service";
import { VideoUploadService } from "./video-upload.service";
import { from, map, tap } from "rxjs";
import { Response } from 'express';
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { UplodedVideoDataCreator, VideoProcess, VideoUploadDTO } from './video.model';
import { ChunkSavedStatus } from "./video-upload.model";
import fs = require("fs");
import * as path from "path";

@Controller('video')
export class VideoController {

    constructor(
        private videoService: VideoService,
        private videoUploadService: VideoUploadService,
        @InjectQueue('video') private readonly videoQueue: Queue
    ) { }

    // TODO: Remove for production
    @Get('clear')
    async clear() {
        if(process.env.NEST_MODE === 'dev'){
            return this.videoService.clear();
        }
    }

    @Get('all')
    async getAll() {
        return this.videoService.getAll();
    }

    @Get('/member/:id')
    async getMemberPath(@Param('id') videoId: number) {
        // get a list of all the files in the folder
        const { dashFilePath } = await this.videoService.loadvideo(videoId);
        const dashFolder = path.dirname(dashFilePath);
        const files = fs.readdirSync(dashFolder);
        return {"data": files}
    }

    @Get('stream/:id/:resolution?')
    @Header('Accept-Ranges', 'bytes')
    @Header('Content-Type', 'video/mp4')
    async getStreamVideo(
        @Param('id') videoId: number,
        @Param('resolution') resolution: string,
        @Headers('range') headers: { 'range': string },
        @Res() res: Response
    ) {
        this.videoService.streamVideo(res, headers, videoId, resolution);
    }

    @Get('/info/:id')
    async videoInfo(@Param('id') videoId: number) {
        const { id, metadata, ...others } = await this.videoService.loadvideo(videoId);
        console.log("others", others);
        return { id, metadata: JSON.parse(metadata) };
    }

    @Get('/fullinfo/:id')
    async widevideoInfo(@Param('id') videoId: number) {
        const { fallbackVideoPath } = await this.videoService.loadvideo(videoId);
        const metadata = await this.videoService.getVideoInfo(fallbackVideoPath)
        return metadata;
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadAndTranscodeDashVideo(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: VideoUploadDTO
    ): Promise<any> {
        return from(this.videoUploadService.handleSavingChunk(file.buffer, body)).pipe(
            tap(({ message, status, videoPath }) => {
                if (status === ChunkSavedStatus.Done) {
                    this.videoQueue.add(
                        VideoProcess.ProcessUploadedVideo,
                        UplodedVideoDataCreator(message, status, videoPath)
                    )
                }
            }),
            map(({ message, status }) => ({ message, status }))
        );
    }
}
