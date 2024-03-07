import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { VideoService } from './video.service';
import { UplodedVideoData } from './video.model';
import { TranscodeApiService } from 'src/transcode/transcode-api.service';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from 'src/storage/storage.service';
import { VideoBuckets } from "./../storage/storage.config";
import * as path from 'path';
import { LoggerService } from 'src/logger/logger.service';

@Processor('video')
export class VideoProcessor {

    constructor(
        private videoService: VideoService,
        private transcodeApiService: TranscodeApiService,
        private storageService: StorageService,
        private logger: LoggerService
    ) { }

    @Process('processUploadedVideo')
    async processUploadedVideo(job: Job<UplodedVideoData>) {
        const { videoPath, userId } = job.data;
        this.logger.log("processUploadedVideo: " + videoPath, VideoProcessor.name);
        try {
            this.logger.log("About to process video", VideoProcessor.name);
            
            // Generate storage UUID folder for video and files
            const uniqueFolderName = uuidv4();

            // Get video metadata
            const metadata = await this.videoService.getVideoBasicInfo(videoPath);
            this.logger.log("Fetched to metadata", VideoProcessor.name);

            // Get a screenshot from the video
            const screenshotPath = await this.videoService.getVideoScreenShot(videoPath);
            this.logger.log("Generated ScreenShot", VideoProcessor.name);

            // Save screenshot in storage
            const imageFilename = path.basename(screenshotPath);
            const { url } = await this.storageService.uploadFileWithFolder(
                userId,
                uniqueFolderName,
                imageFilename,
                screenshotPath
            );
            this.logger.log("Uploaded screenshot to storage", VideoProcessor.name);

            // Save storage location on DB
            const { id } = await this.videoService.saveVideo(videoPath, metadata, url)
            this.logger.log("Video saved to database", VideoProcessor.name);

            // Save bucket name and file Id to DB
            await this.videoService.updateBucketData(id, userId, uniqueFolderName);
            
            // Send the video to transcoding process
            const { width, height } = metadata;
            this.transcodeApiService.triggerTranscodeDash({ width, height, id, userId, videoPath, uniqueFolderName });
            this.logger.log("Video processing done!", VideoProcessor.name);

        } catch (e) {
            this.logger.error("Processing video error", e, VideoProcessor.name)
        }
    }
}
