import { configureStore } from '@reduxjs/toolkit';
import videoUploadSlice from '../features/videoUpload/videoUploadSlice';
import videoSlice from '../features/video/videoSlice';
import notificationSlice from '../features/notification/notificationSlice';
import uiSlice from '../features/ui/uiSlice';
import confirmSlice from '../features/confirm/confirmSlice';
import loginSlice from '../features/login/loginSlice';
import videoListsSlice from '../features/videoList/videoListsSlice';
import userSlice from '../features/user/userSlice';

export const store = configureStore({
    reducer: {
        videoUpload:videoUploadSlice,
        video: videoSlice,
        videoLists: videoListsSlice,
        notification: notificationSlice,
        confirm: confirmSlice,
        ui: uiSlice,
        login: loginSlice,
        user: userSlice
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;