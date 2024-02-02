import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from "../../store/store";

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

interface VideoState {
    videoId: number;
    metadata: VideoMetadata;
    selectedSize: number;
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
        clearVideoData: (state) => {
            state.videoId = 0;
            state.metadata = initialMetadata;
            state.selectedSize = 0;
            state.currentTime = 0;
        }
    }
});

export const selectVideoId = (state: RootState) => state.video.videoId;
export const selectVideoMetadata = (state: RootState) => state.video.metadata;
export const selectSelectedVideoSize = (state: RootState) => state.video.selectedSize;
export const selectCurrentTime = (state: RootState) => state.video.currentTime;

export const { 
    setVideoId, 
    setVideoMetadata, 
    setSelectedVideoSize,
    setCurrentTime, 
    clearVideoData } = videoSlice.actions;

export default videoSlice.reducer;