import { Injectable } from "@nestjs/common";
import * as ffprobeStatic from 'ffprobe-static';
import ffmpegStatic from 'ffmpeg-static';
import { promisify } from "util";
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from "path";
import { Subject } from "rxjs";
import { VideoSizes, AspectRatio, TranscodeProgress, videoBitrates, TrascodeStatus } from "./transcode.model";

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export const ffprobeAsync = promisify<string, ffmpeg.FfprobeData>(ffmpeg.ffprobe);



@Injectable()
export class TrancodeService {

    transcodeVideo(
        videoPath: string,
        videoSize: VideoSizes,
        aspectRatio: AspectRatio = AspectRatio.AR_16_9,
        baseFolderName = "transcode"): Subject<TranscodeProgress> {

        // Check if file exist
        if (!fs.existsSync(videoPath) || !fs.statSync(videoPath).isFile()) {
            throw new Error("Video file does not exist!")
        }
        const filename = path.parse(videoPath).name

        // Create a folder to transcoded videos
        const basePath = path.join(path.dirname(videoPath), `/${filename}_${baseFolderName}/`);
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath);
        }

        const subject = new Subject<TranscodeProgress>();

        // Get video frames count to calculate progress
        // const frames = Number((await ffprobeAsync(videoPath)).streams[0].nb_frames || 0);
        ffprobeAsync(videoPath).then(metadata => {
            const frames = Number(metadata.streams[0].nb_frames || 0);
            const percentageUnit = frames / 100;

            const videoFolder = path.join(basePath!, `${videoSize}p`);
            if (!fs.existsSync(videoFolder)) {
                fs.mkdirSync(videoFolder, { recursive: true });
            }

            const outputPath = path.join(videoFolder!, path.basename(videoPath));

            console.log("outputPath", outputPath)
            ffmpeg.setFfmpegPath(require('ffmpeg-static'));
            ffmpeg()
                // Input file
                .input(videoPath)

                // Audio bit rate
                .size(`"${videoSize}x?"`).aspect(aspectRatio)
                .videoCodec("libx264")

                .withVideoBitrate(videoBitrates[videoSize])

                // Output file

                .saveToFile(outputPath)

                // Log the percentage of work completed
                .on('progress', (progress: any) => {

                    // console.log("progress", progress)
                    if (progress.frames) {
                        console.log(Math.floor(progress.frames / percentageUnit));
                        subject.next({
                            status: TrascodeStatus.Processing,
                            file: outputPath,
                            size: videoSize,
                            percentage: Math.floor(progress.frames / percentageUnit)
                        });
                    }
                    else if (progress.percent) {
                        console.log(`Processing: ${Math.floor(progress.percent)}% done`);
                    } else {
                        console.log("Processing...")
                    }
                })

                // The callback that is run when FFmpeg is finished
                .on('end', () => {
                    console.log('FFmpeg has finished.');
                    subject.next({
                        status: TrascodeStatus.Done,
                        file: outputPath,
                        size: videoSize,
                        percentage: 100
                    });
                })

                // The callback that is run when FFmpeg encountered an error
                .on('error', (error: any) => {
                    console.error(error);
                });
        })


        return subject;
    }

    async transcodeVideo2(
        videoPath: string,
        videoSize: VideoSizes,
        aspectRatio: AspectRatio = AspectRatio.AR_16_9,
        baseFolderName = "transcode"): Promise<Subject<TranscodeProgress>> {

        // Check if video exist on path
        if (!fs.existsSync(videoPath) || !fs.statSync(videoPath).isFile()) {
            throw new Error("Video file does not exist!")
        }

        // ##### CONSTRUCTING OUTPUT FOLDER #####

        // Getting video filename from absolute path
        const videoName = path.parse(videoPath).name
        const folderName = `/${videoName}_${baseFolderName}/`
        const sizeSpecificFolder = `${videoSize}p`;
        const videoFileName = path.basename(videoPath);

        // Create a folder to transcoded videos
        const videoFolder = path.join(path.dirname(videoPath), folderName, sizeSpecificFolder);
        if (!fs.existsSync(videoFolder)) {
            fs.mkdirSync(videoFolder, { recursive: true });
        }

        // Create output file with absolute path
        const outputPath = path.join(videoFolder!, videoFileName);
        console.log("outputPath", outputPath)

        // Get video frames count to calculate progress
        const totalFrames = Number((await ffprobeAsync(videoPath)).streams[0].nb_frames || 0);
        console.log("totalFrames", totalFrames);

        const subject = new Subject<TranscodeProgress>();
        this.ffmpegProcess(videoPath, outputPath, totalFrames, videoSize, aspectRatio, subject);

        return subject;
    }

    ffmpegProcess(
        videoPath: string, 
        outputPath: string, 
        totalFrames: number, 
        videoSize: VideoSizes, 
        aspectRatio: AspectRatio, 
        subject: Subject<TranscodeProgress>
        ) {

        const percentageUnit = totalFrames / 100;
        
        ffmpeg.setFfmpegPath(require('ffmpeg-static'));
        const proccess = ffmpeg()
            // Input file
            .input(videoPath)

            // Audio bit rate
            .size(`"?x${videoSize}"`).aspect(aspectRatio)
            .videoCodec("libx264")

            .withVideoBitrate(videoBitrates[videoSize])

            

            // Log the percentage of work completed
            .on('progress', (progress: any) => {

                // console.log("progress", progress)
                if (progress.frames) {
                    console.log(Math.floor(progress.frames / percentageUnit));
                    subject.next({
                        status: TrascodeStatus.Processing,
                        file: outputPath,
                        size: videoSize,
                        percentage: Math.floor(progress.frames / percentageUnit)
                    });
                }
                else if (progress.percent) {
                    console.log(`Processing: ${Math.floor(progress.percent)}% done`);
                } else {
                    console.log("Processing...")
                }
            })

            // The callback that is run when FFmpeg is finished
            .on('end', () => {
                console.log('FFmpeg has finished.');
                subject.next({
                    status: TrascodeStatus.Done,
                    file: outputPath,
                    size: videoSize,
                    percentage: 100
                });
                // proccess.kill('SIGKILL')
            })

            // The callback that is run when FFmpeg encountered an error
            .on('error', (error: any) => {
                console.error(error);
            })
            // Output file
            .saveToFile(outputPath);
    }
}