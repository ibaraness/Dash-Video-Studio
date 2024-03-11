import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";

interface ConfirmState {
    open: boolean;
    message: string;
    title: string;
    callId: number;
    action: string;
}

const initialState: ConfirmState = {
    open: false,
    message: "This operation is ireversabe, make sure you are ready for that",
    title: "Are you sure you want to do this terrible action? ",
    callId:0,
    action:""
}

export const confirmSlice = createSlice({
    name:'confirm',
    initialState,
    reducers:{
        setConfirmOpen:(state, action: PayloadAction<boolean>) => {
            state.open = action.payload;
        },
        setConfirmMessage: (state, action: PayloadAction<string>) => {
            state.message = action.payload;
        },
        setConfirmTitle: (state, action: PayloadAction<string>) => {
            state.title = action.payload;
        },
        setConfirmCallId: (state, action: PayloadAction<number>) => {
            state.callId = action.payload;
        },
        setConfirmAction: (state, action: PayloadAction<string>) => {
            state.action = action.payload;
        },
    }
});

export const {
    setConfirmMessage,
    setConfirmOpen,
    setConfirmTitle,
    setConfirmCallId,
    setConfirmAction
} = confirmSlice.actions;

export const selectIsConfirmOpen = (state: RootState) => state.confirm.open;
export const selectConfirmMessage = (state: RootState) => state.confirm.message;
export const selectConfirmTitle = (state: RootState) => state.confirm.title;
export const selectConfirmCallId = (state: RootState) => state.confirm.callId;
export const selectConfirmAction = (state: RootState) => state.confirm.action;

export default confirmSlice.reducer;