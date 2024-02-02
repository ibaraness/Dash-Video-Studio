import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ChatGateway } from 'src/transcode/transcode.gateway';
import { TrancodeService } from 'src/transcode/transcode.service';
import { VideoService } from './video.service';

@Processor('video')
export class VideoProcessor {
    private readonly logger = new Logger(VideoProcessor.name);

    constructor(
        private videoService: VideoService,
        private trancodeService: TrancodeService,
        private chatGateway: ChatGateway
    ) { }
    
    @Process('transcode')
    async handleVideoTranscode(job: Job) {
        try {
            //Load the videoData
            this.logger.debug("transcode2");
            this.logger.debug(job.data);
            const { videoId, videoSize } = job.data;
            const { path: videoPath } = await this.videoService.loadvideo(Number(videoId));
            this.logger.debug("path", videoPath);
            const stream = await this.trancodeService.transcodeVideo2(videoPath, videoSize);
            const subscriber = stream.subscribe(({ status, percentage, size, file }) => {
                this.logger.debug(percentage);
                this.chatGateway.io.emit('transcode', { status, percentage, size });
                if (percentage === 100) {
                    this.logger.debug("transcode size", size);
                    this.logger.debug("transcode file", file);
                    this.videoService.updateTrascodeData(videoId, size, file).then(data => {
                        this.logger.debug("data", data);
                    })
                    subscriber.unsubscribe();
                }
            });
        } catch (e) {
            console.log("something went wrong!");
            console.log(e);
        }


    }

    @Process('delay')
    async transcode(job: Job<unknown>) {
        let progress = 0;
        console.log(`Processing job in process ${process.pid} with data: ${job.data}`);
        for (let i = 0; i < 10; i++) {
            await sleeper(1000);
            progress += 1;
            // this.logger.debug(progress);
            await job.progress(progress);
        }
    }


}

async function sleeper(ms: number) {
    return new Promise(resolve => setTimeout(() => resolve({}), ms));
}