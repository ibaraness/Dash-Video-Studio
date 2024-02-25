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
import { StorageService } from "src/storage/storage.service";

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
            return this.videoService.clear();
        }
    }

    @Get('all')
    async getAll() {
        return this.videoService.getAll();
    }

    @Get('test_path')
    async testPath() {
        const { spawn } = require('child_process');

        // Spawn a new process to run the 'ls' command
        // const ls = spawn('ls', ['-l', '-a']);

        const ls = spawn('pwd');

        // Listen for output from the process
        ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        // Listen for errors
        ls.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        // Listen for the process to exit
        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }

    @Get('/member/:id')
    async getMemberPath(@Param('id') videoId: number) {
        // get a list of all the files in the folder
        const { dashFilePath } = await this.videoService.loadvideo(videoId);
        const dashFolder = path.dirname(dashFilePath);
        const files = fs.readdirSync(dashFolder);
        return { "data": files }
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

    @Post('/create-bucket')
    async createBucket(@Body() { name }: { name: string }) {
        console.log("You tries to create a bucket", name);
        if (name && name.length > 2) {
            return this.storageService.createBucket(name);
        }
        return { name };
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
                    console.log("videoPath", videoPath)
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
