import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './tokenProvider';

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

export const postTemplate = async <T = unknown, S = unknown>(url: string, data: T, config?: AxiosRequestConfig | undefined): Promise<CustomResponse<S | null>> => {
    try {
        const res = await axios.post<S>(url, data, config);
        return { isError: false, errorMessage: "", statusCode: res.status, result: "success", data: res.data };
    } catch (err) {
        if (err instanceof AxiosError) {
            return { isError: true, errorMessage: err.response?.data.message, data: null, statusCode: err.status || 500, result: "failure" };
        }
        return { isError: true, errorMessage: "Unknown error occurred, please try again later!", data: null, statusCode: 500, result: "failure" };
    }
}

export const signupUser = async (credentials: SignUpCredentials): Promise<CustomResponse> => {
    const res = await postTemplate<SignUpCredentials, AccessTokenRespons>('/auth/signup', credentials, { withCredentials: true });
    if (res.data) {
        setAccessToken(res.data!.access_token);
    }
    return res;
}

export const loginUser = async (credentials: LoginCresentials): Promise<CustomResponse> => {
    const res = await postTemplate<LoginCresentials, AccessTokenRespons>('/auth/login', credentials, { withCredentials: true });
    if (res.data) {
        setAccessToken(res.data!.access_token);
    }
    return res;
}

export const refreshUserToken = async (): Promise<CustomResponse> => {
    const res = await postTemplate<undefined, AccessTokenRespons>('/auth/refresh', undefined, { withCredentials: true });
    if (res.data) {
        setAccessToken(res.data!.access_token);
    }
    return res;
}

export const logoutUser = async (): Promise<CustomResponse> => {
    return postTemplate<undefined, { message: string }>('/auth/signout', undefined, {
        withCredentials: true,
        headers: { 'Authorization': `Bearer ${getAccessToken() || ""}` }
    });
}

export const editVideo = async <VideoResponse>(
    { id, name, description }: VideoUpdateDetails
): Promise<CustomResponse<VideoResponse | null>> => {
    try {
        const res = await axios.put<VideoResponse>(`/video/${id}`, { name, description }, {
            headers: { 'Authorization': `Bearer ${getAccessToken() || ""}` }
        });
        return { isError: false, errorMessage: "", statusCode: res.status, result: "success", data: res.data };
    } catch (err) {
        if (err instanceof AxiosError) {
            return { isError: true, errorMessage: err.response?.data.message, data: null, statusCode: err.status || 500, result: "failure" };
        }
        return { isError: true, errorMessage: "Unknown error occurred, please try again later!", data: null, statusCode: 500, result: "failure" };
    }
}

export const deleteAVideo = async (id: number): Promise<CustomResponse> => {
    try {
        const res = await axios.delete<null>(`/video/${id}`, {
            headers: { 'Authorization': `Bearer ${getAccessToken() || ""}` }
        });
        return { isError: false, errorMessage: "", statusCode: res.status, result: "success", data: res.data };
    } catch (err) {
        if (err instanceof AxiosError) {
            return { isError: true, errorMessage: err.response?.data.message, data: null, statusCode: err.status || 500, result: "failure" };
        }
        return { isError: true, errorMessage: "Unknown error occurred, please try again later!", data: null, statusCode: 500, result: "failure" };
    }
}

export const getAllVideos = async (): Promise<CustomResponse<VideoResponse[]>> => {
    try {
        const res = await axios.get<VideoResponse[]>(`/video/all`, {
            headers: { 'Authorization': `Bearer ${getAccessToken() || ""}` }
        });
        return { isError: false, errorMessage: "", statusCode: res.status, result: "success", data: res.data };
    } catch (err) {
        if (err instanceof AxiosError) {
            return { isError: true, errorMessage: err.response?.data.message, data: [], statusCode: err.status || 500, result: "failure" };
        }
        return { isError: true, errorMessage: "Unknown error occurred, please try again later!", data: [], statusCode: 500, result: "failure" };
    }
}