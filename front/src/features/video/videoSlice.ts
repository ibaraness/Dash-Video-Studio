import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from "../../store/store";
import { VideoMetadata, VideoResponse } from "../videoList/videoListSlice.model";

interface VideoState {
    videoId: number;
    metadata: VideoMetadata;
    selectedSize: number;
    dashURL: string;
    fallbackURL: string;
    currentTime: number;
}

const initialMetadata = {
    filename: "",
    duration: 0,
    bitRate: 0,
    size: 0,
    width: 0,
    height: 0,
    codecName: "",
    codecType: "",
    frames: 0
}

const initialState: VideoState = {
    videoId: 0,
    metadata: initialMetadata,
    selectedSize:0,
    dashURL:"",
    fallbackURL:"",
    currentTime:0
}

export const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        setVideoId: (state, action: PayloadAction<number>) => {
            state.videoId = action.payload;
        },
        setVideoMetadata: (state, action: PayloadAction<VideoMetadata>) => {
            state.metadata = action.payload;
        },
        setSelectedVideoSize: (state, action: PayloadAction<number>) => {
            state.selectedSize = action.payload;
        },
        setCurrentTime: (state, action: PayloadAction<number>) => {
            state.currentTime = action.payload;
        },
        setDashURL: (state, action: PayloadAction<string>) => {
            state.dashURL = action.payload;
        },
        setFallbackURL: (state, action: PayloadAction<string>) => {
            state.fallbackURL = action.payload;
        },
        setVideo: (state, action:PayloadAction<VideoResponse>) => {
            state.videoId = action.payload.id;
            state.metadata = action.payload.metadata;
            state.dashURL = action.payload.dash;
            state.fallbackURL = action.payload.fallbackVideoPath;
        },
        clearVideoData: (state) => {
            state.videoId = 0;
            state.metadata = initialMetadata;
            state.dashURL = "";
            state.fallbackURL = "";
            state.selectedSize = 0;
            state.currentTime = 0;
        }
    }
});

export const selectVideoId = (state: RootState) => state.video.videoId;
export const selectVideoMetadata = (state: RootState) => state.video.metadata;
export const selectSelectedVideoSize = (state: RootState) => state.video.selectedSize;
export const selectCurrentTime = (state: RootState) => state.video.currentTime;
export const selectDashURL = (state: RootState) => state.video.dashURL;
export const selectFallbackURL = (state: RootState) => state.video.fallbackURL;

export const { 
    setVideoId, 
    setVideoMetadata, 
    setSelectedVideoSize,
    setCurrentTime,
    setDashURL,
    setFallbackURL,
    clearVideoData, 
    setVideo,
} = videoSlice.actions;

export default videoSlice.reducer;