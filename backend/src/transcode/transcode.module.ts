import { Module } from "@nestjs/common";
import { TrancodeService } from "./transcode.service";
import { ChatGateway } from "./transcode.gateway";

@Module({
    imports:[],
    providers: [TrancodeService, ChatGateway],
    exports: [TrancodeService, ChatGateway]
})
export class TranscodeModule {}