import { Module } from "@nestjs/common";
import { VideoController } from "./video.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Video } from "./video.entity";
import { TranscodeModule } from "src/transcode/transcode.module";
import { VideoService } from "./video.service";
import { VideoUploadService } from "./video-upload.service";
import { BullModule } from "@nestjs/bull";
import { VideoProcessor } from "./video.processor";

@Module({
    imports: [
        TypeOrmModule.forFeature([Video]),
        TranscodeModule,
        BullModule.registerQueue({
            name: 'video',
        }),
    ],
    controllers: [VideoController],
    providers: [VideoService, VideoUploadService, VideoProcessor]
})
export class VideoModule { }