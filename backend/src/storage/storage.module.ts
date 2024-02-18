import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { LoggerModule } from "src/logger/logger.module";

@Module({
    imports:[LoggerModule],
    providers: [StorageService],
    exports: [StorageService]
})
export class StorageModule { }