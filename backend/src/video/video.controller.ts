import {
    Body,
    Controller,
    Get,
    Header,
    HttpException,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Req,
    Res,
    StreamableFile,
    UploadedFile,
    UseInterceptors,
    Headers
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import fs = require("fs");
import { TrancodeService } from "src/transcode/transcode.service";
import { VideoBasicInfo, VideoService } from "./video.service";
import * as path from "path";
import { ChunkSavedStatus, VideoUploadService } from "./video-upload.service";
import { forkJoin, from, map, of, switchMap, tap } from "rxjs";
import { createReadStream } from "fs";
import { Request, Response } from 'express';
import { ChatGateway } from "src/transcode/transcode.gateway";
import { VideoSizes } from "src/transcode/transcode.model";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

class VideoUploadDTO {
    chunkNumber: string
    totalChunks: string
    originalname: string
}

class BatchTranscodeDTO {
    videoSizes: string[]
}

class VideoStatusResponse {
    status: string;
    message: string;
    id: number;
    name: string;
}

@Controller('video')
export class VideoController {

    constructor(
        private videoService: VideoService,
        private videoUploadService: VideoUploadService,
        private trancodeService: TrancodeService,
        private chatGateway: ChatGateway,
        @InjectQueue('video') private readonly videoQueue: Queue
    ) { }

    @Get()
    hello() {
        return "hello user!";
    }

    @Get('queue')
    async testQueue() {
        await this.videoQueue.add('transcode', {
            file: 'myVideo.mp4',
        });
    }

    @Get('delay')
    async delay() {
        await this.videoQueue.add('delay', {
            file: 'myVideo.mp4',
        });
    }

    @Get('test_socket')
    async testSocket() {
        this.chatGateway.io.emit('test', 'hello there!');
        return { "message": "sent" };
    }

    @Get('clear')
    async clear() {
        return this.videoService.clear();
    }


    @Get('all')
    async getAll() {
        return this.videoService.getAll();
    }

    @Get('transcode/:id/:size')
    async transcodeQueue(@Param('id') videoId: number, @Param('size') videoSize: VideoSizes){
        await this.videoQueue.add('transcode', {
            videoId,
            videoSize
        });
    }

    @Post('batch-transcode/:id')
    async transcodeBatch(@Param('id') videoId: number, @Body() body: BatchTranscodeDTO){
        
        for(let i = 0; i < body.videoSizes.length; i++){
            await this.videoQueue.add('transcode', {
                videoId,
                videoSize: body.videoSizes[i]
            });
        }
        
    }

    @Get('stream/:id/:resolution?')
    @Header('Accept-Ranges', 'bytes')
    @Header('Content-Type', 'video/mp4')
    async getStreamVideo(@Param('id') videoId: number, @Param('resolution') resolution: string, @Headers() headers, @Res() res: Response) {
        let { path: videoPath, transcode } = await this.videoService.loadvideo(videoId);

        if (resolution && transcode) {
            const transcodeObject = JSON.parse(transcode);
            videoPath = transcodeObject[resolution] || videoPath;
        }

        // Add check if exist
        const { size } = fs.statSync(videoPath);
        // console.log("size", size);
        // throw new HttpException('self employed', HttpStatus.BAD_GATEWAY);

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


    @Get('/image/:id')
    async getImage(@Param('id') videoId: number, @Res({ passthrough: true }) res: Response) {
        const { thumbnail } = await this.videoService.loadvideo(videoId);
        if (!thumbnail || !fs.existsSync(thumbnail)) {
            const errorPath = path.join(__dirname, "../../", "static/404.html");
            if (fs.existsSync(errorPath)) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(fs.readFileSync(errorPath))
            } else {
                throw new NotFoundException(`Image with ID ${videoId} not found`);
            }
            return;
        }
        const image = await fs.promises.readFile(thumbnail);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(image);
    }

    @Get('/info/:id')
    async videoInfo(@Param('id') videoId: number) {
        const { id, metadata, ...others } = await this.videoService.loadvideo(videoId);
        console.log("others", others);
        return { id, metadata: JSON.parse(metadata) };
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadVideo(@UploadedFile() file: Express.Multer.File, @Body() body: VideoUploadDTO): Promise<any> {

        return from(this.videoUploadService.handleSavingChunk(file.buffer, body)).pipe(
            switchMap(({ message, status, path }) => status === ChunkSavedStatus.Done ?
                // Get info of uploaded video 
                from(Promise.all([
                    this.videoService.getVideoBasicInfo(path),
                    this.videoService.saveVideoScreenShot(path)])).pipe(
                        // Saving video metadata to database
                        switchMap(([info, imagePath]) =>
                            from(this.videoService.saveVideo(path, info, imagePath))),
                        map(({ id }) => ({ message, status, id })))
                // Update the client on successfull (and unfinished) chunk upload
                : of({ message, status })
            ));
    }
}
