import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AppConfig } from '../../app/config/config';


// Our base URL for all api calls
const baseURL = AppConfig.API.baseURL;

// Creating a single API base which we use for all of our API calls, 
// the actual endpoints which extends this base are in the feature slices
export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: baseURL }),
    tagTypes: ['VideoList'],
    endpoints: builder => ({
        multiPartUploader: builder.mutation<undefined, VideoChunkInfo>({
            query: (videoChunkInfo) => ({
                url: `/video`,
                method: 'POST',
                body: videoChunkInfo
            }),
        }),
    })
});

export const { useMultiPartUploaderMutation } = apiSlice;

export interface VideoChunkInfo {
    chunkNumber: string;
    totalChunks: string;
    originalname: string;
    uploadId: string;
    file: Blob
}