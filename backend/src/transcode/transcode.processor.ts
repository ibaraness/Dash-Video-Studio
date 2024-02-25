import { Process, Processor } from "@nestjs/bull";
import { TranscodeService } from "./transcode.service";
import { TranscodeGateway } from "./transcode.gateway";
import { Job } from "bull";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TranscodeEvents, PackageTranscodeJobData, TranscodeGateWayEvent } from "./transcode.model";
import { PackageTranscodeDoneEventCreator } from "./transcode.events";
import { LoggerService } from "src/logger/logger.service";


@Processor('transcode')
export class TranscodeProcessor {

    constructor(
        private transcodeGateway: TranscodeGateway,
        private dashService: TranscodeService,
        private eventEmitter: EventEmitter2,
        private readonly logger: LoggerService
    ) { }

    @Process('transcode_dash')
    async transcodeDash(job: Job<PackageTranscodeJobData>) {
        const { width, height, videoPath, id, uniqueFolderName } = job.data;
        const stream = this.dashService.packageAndTranscode(videoPath, width, height);
        const subscriber = stream.subscribe(({ status, percentage, size, mpdFilePath, fallbackFile }) => {
            this.transcodeGateway.io.emit(TranscodeGateWayEvent.PackageTranscode, { status, percentage, size });
            if (percentage === 100) {
                this.logger.debug(`transcoded dash file: ${mpdFilePath}`, TranscodeProcessor.name)
                this.eventEmitter.emit(
                    TranscodeEvents.PackageTranscodeDone,
                    PackageTranscodeDoneEventCreator(id, mpdFilePath, fallbackFile, uniqueFolderName)
                )
                subscriber.unsubscribe();
            }
        });
    }
}