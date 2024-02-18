export interface ProgressPayload {
    percent: number;
    chunkNumber: number;
    totalChunks: number;
}

export interface VideoStatusResponse {
    status: string;
    message: string;
    id: number;
}