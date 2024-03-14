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
    async clear(@Req() req: Request) {
        if (process.env.NEST_MODE === 'dev') {
            const userBucket = req['user']["username"] || VideoBuckets.Dash;
            await this.storageService.deleteAllListOnBucket(userBucket);
            return this.videoService.clear();
        }
    }

    @Get('clear-cache')
    async clearCache() {
        return this.videoService.clearCache();
    }

    @Get('get-req-user')
    async videoListTest(@Req() req: Request) {
        // await this.storageService.deleteAllListOnBucket(VideoBuckets.Dash);
        return {
            "message": req['user']["username"] || "No user"
        }
    }

    @Get('all')
    async getAll(@Req() req: Request) {
        const userId: string = req['userId'] || "";
        return this.videoService.getAll(userId);
    }


    @Get('stream/:id/:resolution?')
    @Header('Accept-Ranges', 'bytes')
    @Header('Content-Type', 'video/mp4')
    async getStreamVideo(
        @Req() req: Request,
        @Param('id') videoId: string,
        @Param('resolution') resolution: string,
        @Headers('range') headers: { 'range': string },
        @Res() res: Response
    ) {
        const userId: string = req['userId'] || "";
        this.videoService.streamVideo(res, headers, videoId, userId, resolution);
    }

    @Get('/info/:id')
    async videoInfo(@Req() req: Request, @Param('id') videoId: string) {
        const userId: string = req['userId'] || "";
        const { id, metadata, ...others } = await this.videoService.loadvideo(videoId, userId);
        return { id, metadata: JSON.parse(metadata) };
    }

    @Get('/fullinfo/:id')
    async widevideoInfo(@Req() req: Request, @Param('id') videoId: string) {
        const userId: string = req['userId'] || "";
        const { fallbackVideoPath } = await this.videoService.loadvideo(videoId, userId);
        const metadata = await this.videoService.getVideoInfo(fallbackVideoPath)
        return metadata;
    }

    @Get('/:id')
    async getSingleVideo(@Req() req: Request, @Param('id') videoId: string) {
        const userId: string = req['userId'] || "";
        const video = await this.videoService.loadvideo(videoId, userId);
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
    async updateVideo(@Req() req: Request,@Param('id') videoId: string, @Body() { name, description }: VideoUpdateDTO) {
        const userId: string = req['userId'] || "";
        const video = await this.videoService.updateNameAndDescription(videoId, name, description, userId);
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
    async deleteVideo(@Req() req: Request, @Param('id') videoId: string) {
        try {
            // Getting the file from database
            const userId: string = req['userId'] || "";
            const video = await this.videoService.loadvideo(videoId, userId);

            // Deleting it from Min.io
            await this.storageService.deleteFiles(video.bucket, video.fileId);

            // Deleting it from db
            const deletedVideo = await this.videoService.deleteVideo(videoId, userId);

            return { deletedVideo };
        } catch (err) {
            const message = err.message || "something went wrong!";
            throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //TODO: Remove in production
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
                    const userName = req['user']["username"] || `user${Math.ceil(Math.random() * 1234)}`;
                    const userId: string = req['userId'] || "";
                    this.videoQueue.add(
                        VideoProcess.ProcessUploadedVideo,
                        UplodedVideoDataCreator(message, status, userName, videoPath, userId)
                    )
                }
            }),
            map(({ message, status }) => ({ message, status }))
        );
    }
}
