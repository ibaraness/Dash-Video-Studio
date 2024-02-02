export enum VideoSizes {
    V_144p = "144",
    V_240p = "240",
    V_360p = "360",
    V_480p = "480",
    V_720p = "720",
    V_1080p = "1080",
    V_1440p = "1440",
    V_2160p = "2160"
}

export enum AspectRatio {
    AR_16_9 = "16:9",
    AR_9_16 = "9:16",
    AR_3_4 = "3:4"
}

export const videoBitrates = {
    "144": "300",
    "240": "400",
    "360": "800",
    "480": "1200",
    "720": "2500",
    "1080": "4500",
    "1440": "8000",
    "2160": "8000"
}

export enum TrascodeStatus {
    Processing = "Processing",
    Done = "Done"
}

export interface TranscodeProgress {
    status: TrascodeStatus;
    file: string;
    size: string;
    percentage: number;
}