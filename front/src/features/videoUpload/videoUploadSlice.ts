import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from "../../store/store";

export enum UploadedStatus {
    Idle,
    OnProgress,
    Complete,
    Error
}

interface VideoUploadState {
    percent: number;
    chunkNumber: number;
    totalChunks: number;
    videoInputValue: string;
    uploadedStatus: UploadedStatus;
}

const initialState: VideoUploadState = {
    percent: 0,
    chunkNumber: 0,
    totalChunks: 0,
    videoInputValue: "",
    uploadedStatus:UploadedStatus.Idle
}

export const videoUploadSlice = createSlice({
    name:'videoUpload',
    initialState,
    reducers: {
        setPercent: (state, action: PayloadAction<number>) => {
            state.percent = action.payload;
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
        setVideoUploadStatus: (state, action: PayloadAction<UploadedStatus>) =>{
            state.uploadedStatus = action.payload;
        }
    }
});

export const selectPercent = (state: RootState) => state.videoUpload.percent;
export const selectVideoInputValue = (state: RootState) => state.videoUpload.videoInputValue;
export const selectVideoUploadStatus = (state: RootState) =>  state.videoUpload.uploadedStatus;
export const { setPercent, setChunkNumber, setTotalChunks, setVideoInputValue, setVideoUploadStatus } = videoUploadSlice.actions;
export default videoUploadSlice.reducer;