import { Module } from "@nestjs/common";
import { TranscodeGateway } from "./transcode.gateway";
import { TranscodeService } from "./transcode.service";
import { BullModule } from "@nestjs/bull";
import { TranscodeProcessor } from "./transcode.processor";
import { TranscodeApiService } from "./transcode-api.service";
import { LoggerModule } from "src/logger/logger.module";
import { StorageModule } from "src/storage/storage.module";

@Module({
    imports:[BullModule.registerQueue({
        name: 'transcode',
    }),
    LoggerModule, StorageModule],
    providers: [TranscodeService, TranscodeGateway, TranscodeProcessor, TranscodeApiService],
    exports: [TranscodeService, TranscodeGateway, TranscodeApiService]
})
export class TranscodeModule {}