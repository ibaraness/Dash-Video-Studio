import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from "../../store/store";

interface TranscodePart {
    status: string;
    percent: number;
}

interface TranscodePartState {
    [name: string]: TranscodePart;
}

interface TranscodeState {
    transcodeData: TranscodePartState;
    sized: string[];
    isConnected: boolean;
}

const initialState: TranscodeState = {
    transcodeData: {},
    sized:[],
    isConnected: false
}

export interface TranscodePayload {
    size: string,
    transcodePart: TranscodePart
}

export const transcodeSlice = createSlice({
    name: 'transcode',
    initialState,
    reducers: {
        setTranscodePart: (state, action: PayloadAction<TranscodePayload>) => {
            state.transcodeData[action.payload.size] = action.payload.transcodePart;
        },
        resetTrascodeData: (state) => {
            state.transcodeData = {};
            state.sized = [];
        },
        setIsConnected: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },
        setTranscodeSize: (state, action: PayloadAction<string>) => {
            if(state.sized.indexOf(action.payload) < 0 ){
                state.sized.push(action.payload);
            }
        }
    }
});

export const selectTranscodeSize =
    (state: RootState, size: string) => state.transcode.transcodeData[size];

export const selectIsConnected = (state: RootState) => state.transcode?.isConnected;
export const selectSizes = (state: RootState) =>  state.transcode.sized;

export const { setTranscodePart, setIsConnected, setTranscodeSize, resetTrascodeData } = transcodeSlice.actions;

export default transcodeSlice.reducer;