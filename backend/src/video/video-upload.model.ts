export interface VideoChunkInfo {
    chunkNumber: string;
    totalChunks: string;
    originalname: string;
    uploadId: string;
}

export enum ChunkSavedStatus {
    Saved = "saved",
    Done = "done"
}

export interface ChunkSavedValue {
    status: ChunkSavedStatus;
    message: string;
    videoPath: string;
}