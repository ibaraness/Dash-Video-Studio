import { EntityState, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '../../store/store';

// export interface Post {
//     id: number,
//     userId: number;
//     title: string;
//     body: string;
// }

export interface VideoResponse {
    id: number;
    name: string;
    thumbnail: string;
    metadata: any;
    transcodeSizes: string[]
}

export interface BatchTranscode {
    videoId: number;
    sizes: string[];
}

// Creating an entity adapter to normalize the user lists into
// object based collection with the users IDs as keys
const videosAdapter = createEntityAdapter<VideoResponse>();

// Generate initial state object with 'ids' and 'entities' for future entries 
const initialState = videosAdapter.getInitialState();

export interface TranscodePartParams {
    videoId: number;
    size: number;
}

// Extending API for user slice to handle user state related actions here
export const videosApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getVideos: builder.query<EntityState<VideoResponse, number>, undefined>({
            query: () => "/video/all",
            transformResponse: (responseData: VideoResponse[]) => {
                // Storing the list of users to an entity adapter
                return videosAdapter.setAll(initialState, responseData);
            },
            providesTags: ['VideoList']
        }),
        transcodePart: builder.mutation<undefined, TranscodePartParams>({
            query: (params) => `/video/transcode/${params.videoId}/${params.size}`,
            invalidatesTags: ['VideoList']
        }),
        batchTranscode:builder.mutation<undefined, BatchTranscode>({
            query: (batchData) => ({
                url: `/video/batch-transcode/${batchData.videoId}`,
                method: 'POST',
                body: {videoSizes: batchData.sizes}
            }),
        }),
    })
});

// Export the auto-generated hook for the `getUsers` query endpoint
export const { useGetVideosQuery, useTranscodePartMutation, useBatchTranscodeMutation } = videosApiSlice;

export const selectVideosResult = videosApiSlice.endpoints.getVideos.select(undefined);

const selectVideosListData = createSelector(
    selectVideosResult,
    videoResult => videoResult.data
)

// Export all user list related selectors
export const { selectAll: selectAllVideos, selectById: selectVideoById } =
    videosAdapter.getSelectors((state:RootState) => selectVideosListData(state) ?? initialState);