import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";


interface UiState {
    // When set to true a responsive behaviour of ui change should be set 
    // in that case even tablet might be considered mobile
    isMobile: boolean;

    // Get the actual size breakpoint
    activeBreakpoint: "xs" | "sm" | "md" | "lg" | "xl";

    // Used when we have to offset the top padding of the container
    // usually if the top element is on fixed position
    topOffset: number;

    topMenuHeight: number;
}

const initialState:UiState = {
    isMobile: false,
    activeBreakpoint: "xs",
    topOffset:0,
    topMenuHeight:0
}

export const uiSlice = createSlice({
    name:'ui',
    initialState,
    reducers:{
        setIsMobile: (state, action: PayloadAction<boolean>) => {
            state.isMobile = action.payload;
        },
        setTopOffset: (state, action: PayloadAction<number>) => {
            state.topOffset = action.payload;
        },
        setTopMenuHeight: (state, action: PayloadAction<number>) => {
            state.topMenuHeight = action.payload;
        },
        setActiveBreakpoint: (state, action: PayloadAction<"xs" | "sm" | "md" | "lg" | "xl">) => {
            state.activeBreakpoint = action.payload;
        },
    }
});

export const selectIsMobile = (state: RootState) => state.ui.isMobile;
export const selectTopOffset = (state: RootState) => state.ui.topOffset;
export const selectActiveBreakpoint = (state: RootState) => state.ui.activeBreakpoint;
export const selectTopMenuHeight = (state: RootState) => state.ui.topMenuHeight;

export const {setIsMobile, setTopOffset, setActiveBreakpoint, setTopMenuHeight} = uiSlice.actions;

export default uiSlice.reducer;