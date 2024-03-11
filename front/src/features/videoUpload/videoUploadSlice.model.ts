export enum UploadedStatus {
    Idle,
    OnProgress,
    Complete,
    Error
}

export interface VideoUploadState {
    percent: number;
    transcodePercent: number;
    chunkNumber: number;
    totalChunks: number;
    uploadedStatus: UploadedStatus;
    isConnectedToServer: boolean;
    videoName: string;
    videoDescription: string;
    file: File | null;
    uploadMode: "active" | "inactive"
}