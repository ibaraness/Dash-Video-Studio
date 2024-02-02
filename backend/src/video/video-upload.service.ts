import { HttpException, Injectable } from "@nestjs/common";
import * as ffprobeStatic from 'ffprobe-static';
import ffmpegStatic from 'ffmpeg-static';
import { promisify } from "util";
import * as ffmpeg from 'fluent-ffmpeg';
import { Config } from "src/config/app.config";
import fs = require("fs");
import path = require("path");

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export const ffprobeAsync = promisify<string, ffmpeg.FfprobeData>(ffmpeg.ffprobe);

interface VideoChunkInfo {
    chunkNumber: string
    totalChunks: string
    originalname: string
}

export enum ChunkSavedStatus {
    Saved = "saved",
    Done = "done"
}

export interface ChunkSavedValue {
    status: ChunkSavedStatus;
    message: string;
    path?: string;
}

@Injectable()
export class VideoUploadService {

    async handleSavingChunk(
        chunk: Buffer, { chunkNumber, totalChunks, originalname }: VideoChunkInfo
        ): Promise<ChunkSavedValue> {
        const fileName = originalname;

        const chunkDir = path.join(
            __dirname, "../../", 
            Config.upload.baseDirectory, 
            Config.upload.chunks.directory
            );

        if (!fs.existsSync(chunkDir)) {
            fs.mkdirSync(chunkDir);
        }

        const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

        try {
            await fs.promises.writeFile(chunkFilePath, chunk);

            if (Number(chunkNumber) === Number(totalChunks) - 1) {
                // If this is the last chunk, merge all chunks into a single file
                const videoPath = await this.mergeChunks(fileName, Number(totalChunks));
                return { status: ChunkSavedStatus.Done, message: Config.upload.chunks.SuccessfullyUploadedMessage, path:videoPath }
            }
            return { status: ChunkSavedStatus.Saved, message: Config.upload.chunks.SuccessfullyUploadedMessage, path: "" }

        } catch (error) {
            console.error(Config.upload.chunks.errorMessage, error);
            throw new HttpException(Config.upload.chunks.errorMessage, 500);
        }
    }

    private async mergeChunks(fileName: string, totalChunks: number): Promise<string> {
        // const chunkDir = __dirname + "/chunks";
        const chunkDir = path.join(
            __dirname, "../../", 
            Config.upload.baseDirectory, 
            Config.upload.chunks.directory
            );

        //const mergedFilePath = __dirname + "/merged_files";
        const mergedFilePath = path.join(
            __dirname, "../../", 
            Config.upload.baseDirectory, 
            Config.upload.merged.directory
            );

        if (!fs.existsSync(mergedFilePath)) {
            fs.mkdirSync(mergedFilePath);
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