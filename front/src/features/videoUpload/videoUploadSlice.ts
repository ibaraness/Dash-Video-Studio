import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from "../../store/store";
import { UploadedStatus, VideoUploadState } from "./videoUploadSlice.model";

const initialState: VideoUploadState = {
    percent: 0,
    transcodePercent: 0,
    chunkNumber: 0,
    totalChunks: 0,
    uploadedStatus: UploadedStatus.Idle,
    isConnectedToServer: false,
    videoName:"",
    videoDescription:"",
    file: null,
    uploadMode: "inactive"
}

export const videoUploadSlice = createSlice({
    name: 'videoUpload',
    initialState,
    reducers: {
        setPercent: (state, action: PayloadAction<number>) => {
            state.percent = action.payload;
        },
        setTranscodePercent: (state, action: PayloadAction<number>) => {
            state.transcodePercent = action.payload;
        },
        setChunkNumber: (state, action: PayloadAction<number>) => {
            state.chunkNumber = action.payload;
        },
        setTotalChunks: (state, action: PayloadAction<number>) => {
            state.totalChunks = action.payload;
        },
        setVideoUploadStatus: (state, action: PayloadAction<UploadedStatus>) => {
            state.uploadedStatus = action.payload;
        },
        setIsConectedToServer: (state, action: PayloadAction<boolean>) => {
            state.isConnectedToServer = action.payload;
        },
        setVideoName: (state, action: PayloadAction<string>) => {
            state.videoName = action.payload;
        },
        setVideoDescription: (state, action: PayloadAction<string>) => {
            state.videoDescription = action.payload;
        },
        setVideoFile: (state, action: PayloadAction<File | null>) => {
            state.file = action.payload;
        },
        setUploadMode: (state, action: PayloadAction<"active" | "inactive">) => {
            state.uploadMode = action.payload;
        },
    }
});

export const selectPercent = (state: RootState) => state.videoUpload.percent;
export const selectVideoUploadStatus = (state: RootState) => state.videoUpload.uploadedStatus;
export const selectTranscodePercent = (state: RootState) => state.videoUpload.transcodePercent;
export const selectIsConnectedToServer = (state: RootState) => state.videoUpload.isConnectedToServer;
export const selectVideoName = (state: RootState) => state.videoUpload.videoName;
export const selectVideoDescription = (state: RootState) => state.videoUpload.videoDescription;
export const selectVideoFile = (state: RootState) => state.videoUpload.file;
export const selectUploadMode = (state: RootState) => state.videoUpload.uploadMode;

export const {
    setPercent,
    setChunkNumber,
    setTotalChunks,
    setVideoUploadStatus,
    setTranscodePercent,
    setIsConectedToServer,
    setVideoName,
    setVideoDescription,
    setVideoFile,
    setUploadMode
} = videoUploadSlice.actions;

export default videoUploadSlice.reducer;