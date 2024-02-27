import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from "../../store/store";
import { VideoMetadata, VideoResponse } from "../videoList/videoListSlice.model";

interface VideoState {
    videoId: number;
    videoName: string;
    videoDescription: string | null;
    metadata: VideoMetadata;
    selectedSize: number;
    dashURL: string;
    fallbackURL: string;
    currentTime: number;
    mode: "display" | "edit" | "loading"
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
    videoName: "",
    videoDescription: null,
    metadata: initialMetadata,
    selectedSize:0,
    dashURL:"",
    fallbackURL:"",
    currentTime:0,
    mode: "display"
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
            state.videoName = action.payload.name;
            state.videoDescription = action.payload.description || null;
        },
        clearVideoData: (state) => {
            state.videoId = 0;
            state.metadata = initialMetadata;
            state.dashURL = "";
            state.fallbackURL = "";
            state.selectedSize = 0;
            state.currentTime = 0;
            state.mode = "display";
            state.videoName = "";
            state.videoDescription = null;
        },
        setVideoName: (state, action: PayloadAction<string>) => {
            state.videoName = action.payload;
        },
        setVideoDescription: (state, action: PayloadAction<string>) => {
            state.videoDescription = action.payload;
        },
        setVideoMode: (state, action: PayloadAction<"display" | "edit" | "loading">) => {
            state.mode = action.payload;
        },
    }
});

export const selectVideoId = (state: RootState) => state.video.videoId;
export const selectVideoMetadata = (state: RootState) => state.video.metadata;
export const selectSelectedVideoSize = (state: RootState) => state.video.selectedSize;
export const selectCurrentTime = (state: RootState) => state.video.currentTime;
export const selectDashURL = (state: RootState) => state.video.dashURL;
export const selectFallbackURL = (state: RootState) => state.video.fallbackURL;
export const selectVideoName = (state: RootState) => state.video.videoName;
export const selectVideoDescription = (state: RootState) => state.video.videoDescription;
export const selectVideoMode = (state: RootState) => state.video.mode;

export const { 
    setVideoId, 
    setVideoMetadata, 
    setSelectedVideoSize,
    setCurrentTime,
    setDashURL,
    setFallbackURL,
    clearVideoData, 
    setVideo,
    setVideoName,
    setVideoDescription,
    setVideoMode
} = videoSlice.actions;

export default videoSlice.reducer;