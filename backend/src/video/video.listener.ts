import { VideoBuckets } from './../storage/storage.config';
import { Injectable } from "@nestjs/common";
import { OnEvent } from '@nestjs/event-emitter';
import { PackageTranscodeDoneEvent } from "src/transcode/transcode.events";
import { TranscodeEvents, TranscodeGateWayEvent } from "src/transcode/transcode.model";
import { VideoService } from "./video.service";
import { TranscodeApiService } from "src/transcode/transcode-api.service";
import { StorageService } from "src/storage/storage.service";
import * as path from "path";
import { VideoPublic } from './video.model';
import { LoggerService } from 'src/logger/logger.service';
import fs = require("fs");

@Injectable()
export class VideoListener {

    constructor(
        private videoService: VideoService,
        private transcodeApiService: TranscodeApiService,
        private storageService: StorageService,
        private logger: LoggerService
    ) { }

    @OnEvent(TranscodeEvents.PackageTranscodeDone)
    async handleVideoPackageAndTranscode({ id, file, fallbackFile, uniqueFolderName }: PackageTranscodeDoneEvent) {

        try {
            // Upload all dash files to Storage service (S3)
            const dashFolder = path.dirname(file);
            const { url } = await this.storageService.uploadFolder(VideoBuckets.Dash, dashFolder, uniqueFolderName);

            // Save dash URL to DB
            const mpfFilename = path.basename(file);
            const mpdUrl = `${url}/${mpfFilename}`;

            const mp4filename = path.basename(fallbackFile);
            const mp4FallbackUrl = `${url}/${mp4filename}`;

            await this.videoService.updateDashData(id, mpdUrl || file, mp4FallbackUrl);
            this.logger.log("Save dash URL to DB" + mpdUrl, VideoListener.name);

            // Notify client that video was updated and send it (websocket)
            const video = await this.videoService.getById(id);
            this.transcodeApiService.socketMessage<VideoPublic>(TranscodeGateWayEvent.VideoUpdated, video);

            // Remove temporary file from local storage
            const baseFolder = path.join(dashFolder, "..");
            this.logger.log("Delete temporary file on folder" + baseFolder, VideoListener.name);
            if(fs.existsSync(baseFolder)){
                fs.rmSync(baseFolder, {force: true, recursive: true});
            }
        } catch (error) {
            this.logger.error("Error processing files", error, VideoListener.name);
        }
    }
}