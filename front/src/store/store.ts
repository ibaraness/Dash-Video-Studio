import { configureStore } from '@reduxjs/toolkit'
import videoUploadSlice from '../features/videoUpload/videoUploadSlice'
import videoSlice from '../features/video/videoSlice';
import transcodeSlice from '../features/transcode/transcodeSlice';
import { apiSlice } from '../features/api/apiSlice';

export const store = configureStore({
    reducer: {
        videoUpload:videoUploadSlice,
        video: videoSlice,
        transcode: transcodeSlice,
        [apiSlice.reducerPath]: apiSlice.reducer
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(apiSlice.middleware)
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;