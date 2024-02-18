import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { TranscodeDash } from "./transcode.model";
import { TranscodeGateway } from "./transcode.gateway";

@Injectable()
export class TranscodeApiService {
    constructor(
        private transcodeGateway: TranscodeGateway,
        @InjectQueue('transcode') private readonly transcodeQueue: Queue,
    ){}

    // trigger transcode dash
    triggerTranscodeDash(data: TranscodeDash){
        this.transcodeQueue.add('transcode_dash', data);
    }

    socketMessage<T = any>(name: string, data: T){
        this.transcodeGateway.io.emit(name, data);
    }
}