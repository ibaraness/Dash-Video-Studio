import { existsSync, mkdirSync } from 'fs';
import { Injectable, NotFoundException } from "@nestjs/common";
import * as ffmpeg from 'fluent-ffmpeg';
import { Subject } from 'rxjs';
import { TranscodeDashProgress, TrascodeStatus } from './transcode.model';
import { LoggerService } from 'src/logger/logger.service';
const path = require('path');

// TODO: check video frame rate, process with different bitrate on different frame rates

@Injectable()
export class TranscodeService {

    constructor(private logger: LoggerService){}

    packageAndTranscode(videoPath: string, width: number, height: number) {

        const localLogger = this.logger;

        // Making sure we have an abslute path t source video
        const inputPath = path.resolve(videoPath);

        // Exit with exception if video does not exist 
        if (!existsSync(inputPath)) {
            throw new NotFoundException()
        }

        // set resolution and bitrates stop points: [resolution, bitrate]
        let resolutionsAndBitrates = [
            [144, 250], 
            [240, 350],
            [480, 700],
            [720, 2500],
            [1080, 4500],
            [1440, 8000],
            [2160, 10000]
        ];

        // Checking if height is bigger or equal to width and set the sizes accordingly
        const isLandscape = height < width; 

        // Set the unit we compare sizes to, in order to calculate resolution stop points (sizes)
        const resolutionScalingFactor  = isLandscape ? height : width;

        // Remove resolutions that are greater than the video's resolution
        resolutionsAndBitrates = resolutionsAndBitrates.filter(size => size[0] < resolutionScalingFactor + 1)

        // Set fallback video size, for traditional streaming for browsers which do not support dash
        // [resolution, bitrate]
        const fallback = [480, 400];

        // Video name (filename without extention and path)
        let videoName = path.basename(videoPath, path.extname(videoPath));

        // The target dir where we will save the dash files
        const targetdir = path.join(path.dirname(videoPath), "../", "dash");

        // The manifest filename path of the dash
        const mpdFilePath = path.join(targetdir, `${videoName}.mpd`);

        if (!existsSync(targetdir)) {
            mkdirSync(targetdir);
        }

        // Dash output directoy and files
        const subject = new Subject<TranscodeDashProgress>();

        // ##### FFMPEG SETTINGS #####

        // Set ffmpeg path to fluent-ffmpeg
        ffmpeg.setFfmpegPath(require('ffmpeg-static'));
        ffmpeg.setFfprobePath(require('ffprobe-static').path);

        // Create FFMPEG process with source and target directory
        const process = ffmpeg({
            source: inputPath,
            cwd: targetdir
        });

        process.output(mpdFilePath)
            // Setting the output format - 'dash'
            .format("dash")

            // setting video codec - 'libx264'
            .videoCodec('libx264')

            // setting audio codec - 'aac'
            .audioCodec('aac')

            // setting audio channels (2 channels)
            .audioChannels(2)

            // setting audio frequency (44100)
            .audioFrequency(44100)

            // Settings for x264 compression
            .outputOptions([
                '-preset veryfast', // Encoding preset
                '-keyint_min 60', // specifies the minimum length of the GOP.
                '-g 60', // maximum length of the GOP
                '-sc_threshold 0', // equivalent to the no-scenecut option
                '-profile:v main', // limits the output to a specific H.264 profile 
                '-use_template 1', // Enable use of SegmentTemplate instead of SegmentList
                '-use_timeline 1', // Enable use of SegmentTimeline within the SegmentTemplate

                // Force fixed P/B pattern
                // Disable B-frames adaptive algorithm and specify max consecutive B-frames number
                '-b_strategy 0', // Disable B-frames adaptive algorithm
                '-bf 1', // max consecutive B-frames number

                '-map 0:a?', // Select all audio streams from first input
                '-b:a 96k' // set audio streams to 96k
            ]);

        // Looping and setting sizes and bitrates
        for (var resolutionAndBitRate of resolutionsAndBitrates) {
            let index = resolutionsAndBitrates.indexOf(resolutionAndBitRate);
            const resolution = resolutionAndBitRate[0];
            const bitrate = resolutionAndBitRate[1];

            // Set whether the width or height should be affected 
            const scaleResolution = isLandscape ? `scale=-2:${resolution}` : `scale=${resolution}:-2`;

            process
                .outputOptions([
                    // Creating a complex filter 
                    `-filter_complex [0]format=pix_fmts=yuv420p[temp${index}];[temp${index}]${scaleResolution}[A${index}]`,
                    `-map [A${index}]:v`,
                    `-b:v:${index} ${bitrate}k`,
                ]);
        }

        // setting for fallback version
        // Fallback version
        const fallbackFile = path.join(targetdir, `${videoName}.mp4`);
        process
            .output(fallbackFile) 
            .format('mp4')
            .videoCodec('libx264')
            .videoBitrate(fallback[1])
            .size(`?x${fallback[0]}`)
            .audioCodec('aac')
            .audioChannels(2)
            .audioFrequency(44100)
            .audioBitrate(128)
            .outputOptions([
                '-preset veryfast',
                '-movflags +faststart',
                '-keyint_min 60',
                '-refs 5',
                '-g 60',
                '-pix_fmt yuv420p',
                '-sc_threshold 0',
                '-profile:v main',
            ]);

        process.on('start', function (commandLine) {
            localLogger.debug('Spawned Ffmpeg with command: ' + commandLine, TranscodeService.name);
        });

        process.on('progress', function(progress) {
            localLogger.debug(`Progres: ${Math.floor(progress.percent)}`, TranscodeService.name);
            if (progress.percent) {
                subject.next({
                    status: TrascodeStatus.Processing,
                    mpdFilePath,
                    fallbackFile,
                    size: "Unknown",
                    percentage: Math.floor(progress.percent)
                });
            }
        })
            .on('end', function () {
                localLogger.debug('complete', TranscodeService.name);
                subject.next({
                    status: TrascodeStatus.Done,
                    mpdFilePath,
                    fallbackFile,
                    size: "Unknown",
                    percentage: 100
                });
                subject.complete();
            })
            .on('error', function (err) {
                localLogger.error("Transcode error", err, TranscodeService.name);
            });
        process.run();
        return subject;
    }
}