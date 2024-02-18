import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from "../../store/store";
import { UploadedStatus, VideoUploadState } from "./videoUploadSlice.model";

const initialState: VideoUploadState = {
    percent: 0,
    transcodePercent: 0,
    chunkNumber: 0,
    totalChunks: 0,
    videoInputValue: "",
    uploadedStatus: UploadedStatus.Idle,
    isConnectedToServer: false
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
        setVideoInputValue: (state, action: PayloadAction<string>) => {
            state.videoInputValue = action.payload;
        },
        setVideoUploadStatus: (state, action: PayloadAction<UploadedStatus>) => {
            state.uploadedStatus = action.payload;
        },
        setIsConectedToServer: (state, action: PayloadAction<boolean>) => {
            state.isConnectedToServer = action.payload;
        }
    }
});

export const selectPercent = (state: RootState) => state.videoUpload.percent;
export const selectVideoInputValue = (state: RootState) => state.videoUpload.videoInputValue;
export const selectVideoUploadStatus = (state: RootState) => state.videoUpload.uploadedStatus;
export const selectTranscodePercent = (state: RootState) => state.videoUpload.transcodePercent;
export const selectIsConnectedToServer = (state: RootState) => state.videoUpload.isConnectedToServer;

export const {
    setPercent,
    setChunkNumber,
    setTotalChunks,
    setVideoInputValue,
    setVideoUploadStatus,
    setTranscodePercent,
    setIsConectedToServer
} = videoUploadSlice.actions;

export default videoUploadSlice.reducer;