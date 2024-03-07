import {
    Body,
    Controller,
    Get,
    Header, Param,
    Post, Res, UploadedFile,
    UseInterceptors,
    Headers,
    Put,
    Delete,
    HttpException,
    HttpStatus,
    Req
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { VideoService } from "./video.service";
import { VideoUploadService } from "./video-upload.service";
import { from, map, tap } from "rxjs";
import { Request, Response } from 'express';
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { UplodedVideoDataCreator, VideoProcess, VideoUpdateDTO, VideoUploadDTO } from './video.model';
import { ChunkSavedStatus } from "./video-upload.model";
import fs = require("fs");
import * as path from "path";
import { StorageService } from "src/storage/storage.service";
import { VideoBuckets } from "src/storage/storage.config";
import { Public } from "src/auth/decorators/public.decorator";

@Controller('video')
export class VideoController {

    constructor(
        private videoService: VideoService,
        private videoUploadService: VideoUploadService,
        private storageService: StorageService,
        @InjectQueue('video') private readonly videoQueue: Queue
    ) { }

    // TODO: Remove for production
    @Get('clear')
    async clear() {
        if (process.env.NEST_MODE === 'dev') {
            await this.storageService.deleteAllListOnBucket(VideoBuckets.Dash);
            return this.videoService.clear();
        }
    }

    @Get('get-req-user')
    async videoListTest(@Req() req: Request){
        // await this.storageService.deleteAllListOnBucket(VideoBuckets.Dash);
        return {
            "message": req['user']["username"] || "No user ID"
        }
    }

    @Get('all')
    async getAll() {
        return this.videoService.getAll();
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
        return { id, metadata: JSON.parse(metadata) };
    }

    @Get('/fullinfo/:id')
    async widevideoInfo(@Param('id') videoId: number) {
        const { fallbackVideoPath } = await this.videoService.loadvideo(videoId);
        const metadata = await this.videoService.getVideoInfo(fallbackVideoPath)
        return metadata;
    }

    @Get('/:id')
    async getSingleVideo(@Param('id') videoId: number) {
        const video = await this.videoService.loadvideo(videoId);
        const { dashFilePath, thumbnail, fallbackVideoPath, ...rest } = video;
        return {
            ...rest,
            fallbackVideoPath: this.videoService.getPublicURL(fallbackVideoPath),
            thumbnail: this.videoService.getPublicURL(thumbnail),
            dash: this.videoService.getPublicURL(dashFilePath),
            metadata: JSON.parse(rest.metadata)
        }
    }

    // Upadte video title, description and tags
    @Put('/:id')
    async updateVideo(@Param('id') videoId: number, @Body() { name, description }: VideoUpdateDTO) {
        const video = await this.videoService.updateNameAndDescription(videoId, name, description);
        const { dashFilePath, thumbnail, fallbackVideoPath, ...rest } = video;
        return {
            ...rest,
            fallbackVideoPath: this.videoService.getPublicURL(fallbackVideoPath),
            thumbnail: this.videoService.getPublicURL(thumbnail),
            dash: this.videoService.getPublicURL(dashFilePath),
            metadata: JSON.parse(rest.metadata)
        }
    }

    @Delete('/:id')
    async deleteVideo(@Param('id') videoId: number) {
        try {
            // Getting the file from database
            const video = await this.videoService.loadvideo(videoId);

            // Deleting it from Min.io
            await this.storageService.deleteFiles(video.bucket, video.fileId);

            // Deleting it from db
            const deletedVideo = await this.videoService.deleteVideo(videoId);
            console.log(deletedVideo);
            return { deletedVideo };
        } catch (err) {
            const message = err.message || "something went wrong!";
            throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Public()
    @Post('/create-bucket')
    async createBucket(@Body() { name }: { name: string }) {
        if (name && name.length > 2) {
            return this.storageService.createBucket(name);
        }
        return { name };
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadAndTranscodeDashVideo(
        @Req() req: Request,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: VideoUploadDTO
    ): Promise<any> {
        return from(this.videoUploadService.handleSavingChunk(file.buffer, body)).pipe(
            tap(({ message, status, videoPath }) => {
                if (status === ChunkSavedStatus.Done) {
                    const userId = req['user']["username"] || `user${Math.ceil(Math.random() * 1234)}`;
                    this.videoQueue.add(
                        VideoProcess.ProcessUploadedVideo,
                        UplodedVideoDataCreator(message, status, userId, videoPath)
                    )
                }
            }),
            map(({ message, status }) => ({ message, status }))
        );
    }
}
