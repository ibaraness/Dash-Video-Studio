import { CustomResponse, SignUpCredentials, LoginCresentials, VideoUpdateDetails, VideoResponse, UserInfoRes } from './restAPI.model';
import authHttpService from './authHTTPService';

export const signupUser = async (credentials: SignUpCredentials): Promise<CustomResponse> => {
    return authHttpService.signupUser(credentials);
}

export const loginUser = async (credentials: LoginCresentials): Promise<CustomResponse> => {
    return authHttpService.loginUser(credentials);
}

export const refreshUserToken = async (): Promise<CustomResponse> => {
    return authHttpService.refreshUserToken();
}

export const logoutUser = async (): Promise<CustomResponse> => {
    return authHttpService.logoutUser();
}

export const editVideo = async <VideoResponse>(
{ id, name, description }: VideoUpdateDetails
): Promise<CustomResponse<VideoResponse | null>> => {
    return authHttpService.put<{ name: string, description: string }, VideoResponse>(`/video/${id}`, { name, description });
}

export const deleteAVideo = async (id: string): Promise<CustomResponse> => {
    return authHttpService.delete(`/video/${id}`);
}

export const getAllVideos = async (): Promise<CustomResponse<VideoResponse[] | null>> => {
    // await (new Promise(resolve => setTimeout(resolve, 1000)))
    return authHttpService.get<VideoResponse[]>(`/video/all`);
}
export const getUserInfo = async (): Promise<CustomResponse<UserInfoRes | null>> => {
    return authHttpService.get<UserInfoRes>('/auth/profile')
}

