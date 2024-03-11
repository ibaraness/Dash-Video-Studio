import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";

interface NotificationState {
    open: boolean;
    severity: "success" | "info" | "warning" | "error";
    message: string;
}

const initialState: NotificationState = {
    open: false,
    severity: "info",
    message:""
}

export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setOpen: (state, action: PayloadAction<boolean>) => {
            state.open = action.payload;
        },
        setSeverity: (state, action: PayloadAction<"success" | "info" | "warning" | "error">) => {
            state.severity = action.payload;
        },
        setMessage: (state, action: PayloadAction<string>) => {
            state.message = action.payload;
        },
    }
});

export const selectIsOpen = (state: RootState) => state.notification.open;
export const selectSeverity = (state: RootState) => state.notification.severity;
export const selectMessage = (state: RootState) => state.notification.message;

export const {
    setMessage,
    setOpen,
    setSeverity
} = notificationSlice.actions;

export default notificationSlice.reducer;