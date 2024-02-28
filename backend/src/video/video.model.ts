import { ChunkSavedStatus } from "./video-upload.model";
import { IsInt, IsString, IsNumberString, MinLength, MaxLength } from 'class-validator';

export class VideoUploadDTO {
    @IsNumberString()
    chunkNumber: string;

    @IsNumberString()
    totalChunks: string;

    @IsString()
    originalname: string;

    @IsString()
    @MinLength(10)
    uploadId: string
}

export class VideoUpdateDTO {
    @IsString()
    @MaxLength(70)
    @MinLength(1)
    name: string;
    
    @IsString()
    description: string;
}

export class VideoUploadJob extends VideoUploadDTO {
    file: Express.Multer.File;
}

export class BatchTranscodeDTO {
    videoSizes: string[]
}

export class UplodedVideoData {
    message: string;
    status: ChunkSavedStatus;
    videoPath: string;
}

export interface VideoPublic {
    fallbackVideoPath: string;
    thumbnail: string;
    dash: string;
    metadata: any;
    id: number;
    name: string;
    description: string;
    createDateTime: Date;
    lastChangedDateTime: Date;
}

export const UplodedVideoDataCreator = (message: string, status: ChunkSavedStatus, videoPath: string) => {
    const uplodedVideoData = new UplodedVideoData();
    uplodedVideoData.message = message;
    uplodedVideoData.status = status;
    uplodedVideoData.videoPath = videoPath;
    return uplodedVideoData;
}

export enum VideoProcess {
    ProcessUploadedVideo = "processUploadedVideo"
}

export interface VideoBasicInfo {
    filename: string;
    duration: number;
    bitRate: number;
    size: number;
    width: number;
    height: number;
    codecName: string;
    codecType: string;
    frameRate: string;
    frames: number;
}