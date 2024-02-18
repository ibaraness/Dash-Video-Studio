import { HttpException, Injectable } from "@nestjs/common";
import { Config } from "src/config/app.config";
import { VideoChunkInfo, ChunkSavedValue, ChunkSavedStatus } from "./video-upload.model";
import fs = require("fs");
import path = require("path");
import { LoggerService } from "src/logger/logger.service";
import { v4 as uuidv4 } from 'uuid';

const getBasedir = (uploadId: string): string => {
    return path.join(
        __dirname, "../../",
        Config.upload.baseDirectory,
        uploadId
    );
}

@Injectable()
export class VideoUploadService {

    constructor(private readonly logger: LoggerService){}

    async handleSavingChunk(
        chunk: Buffer,
        { chunkNumber, totalChunks, originalname: fileName, uploadId }: VideoChunkInfo
    ): Promise<ChunkSavedValue> {

        const baseDir = getBasedir(uploadId);

        const chunkDir = path.join(baseDir, Config.upload.chunks.directory);

        if (!fs.existsSync(chunkDir)) {
            fs.mkdirSync(chunkDir, { recursive: true });
        }

        const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

        try {
            await fs.promises.writeFile(chunkFilePath, chunk);
  
            this.logger.debug(chunkNumber, "VideoUploadService");
            if (Number(chunkNumber) === Number(totalChunks) - 1) {
                // If this is the last chunk, merge all chunks into a single file
                const videoPath = await this.mergeChunks(fileName, Number(totalChunks), baseDir, chunkDir);
                return { status: ChunkSavedStatus.Done, message: Config.upload.chunks.SuccessfullyUploadedMessage, videoPath }
            }
            return { status: ChunkSavedStatus.Saved, message: Config.upload.chunks.SuccessfullyUploadedMessage, videoPath: "" }

        } catch (error) {
            this.logger.error(Config.upload.chunks.errorMessage, error, "VideoUploadService");
            throw new HttpException(Config.upload.chunks.errorMessage, 500);
        }
    }

    private async mergeChunks(fileName: string, totalChunks: number, baseDir: string, chunkDir: string): Promise<string> {

        const mergedFilePath = path.join(baseDir, Config.upload.merged.directory);

        if (!fs.existsSync(mergedFilePath)) {
            fs.mkdirSync(mergedFilePath, { recursive: true });
        }

        const outputPath = `${mergedFilePath}/${fileName}`;
        const writeStream = fs.createWriteStream(outputPath);
        for (let i = 0; i < totalChunks; i++) {
            const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
            const chunkBuffer = await fs.promises.readFile(chunkFilePath);
            writeStream.write(chunkBuffer);
            fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
        }

        writeStream.end();
        return outputPath;
    }
}