import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";

export interface UserState {
    username: string;
}

const initialState: UserState = {
    username:""
}

export const userSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        setUsername: (state, action: PayloadAction<string>) => {
            state.username = action.payload;
        }
    }
});

export const selectUsername = (state: RootState) => state.user.username;

export const {setUsername} = userSlice.actions;

export default userSlice.reducer;