export interface BaseResponse {
    isError: boolean;
    errorMessage: string;
    statusCode: number;
    data?: unknown;
    result: "success" | "failure"
}

export interface CustomResponse<S = unknown> extends BaseResponse {
    data: S;
}

export interface SignUpCredentials {
    username: string,
    password: string,
    email: string
}

export interface LoginCresentials {
    username: string,
    password: string
}

export interface VideoUpdateDetails {
    id: number | string;
    name: string;
    description: string;
}

export interface AccessTokenRespons {
    access_token: string
}

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
    description: string | null;
    thumbnail: string;
    metadata: VideoMetadata;
    fallbackVideoPath: string;
    dash: string;
    createDateTime: Date;
    lastChangedDateTime: Date;
}
