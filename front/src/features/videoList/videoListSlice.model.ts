
export interface VideoMetadata {
    filename: string;
    duration: number;
    bitRate: number;
    size: number;
    width: number;
    height: number;
    codecName: string;
    codecType: string;
    frames: number;
}

export interface VideoResponse {
    id: number;
    name: string;
    thumbnail: string;
    metadata: VideoMetadata;
    fallbackVideoPath: string;
    dash: string;
}


export interface BatchTranscode {
    videoId: number;
    sizes: string[];
}