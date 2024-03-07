import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";

interface LoginState {
    // Login status
    isLoggedIn: boolean;
    loggedInUser: string;
    refreshAttempts: number;

    // Login form
    username: string;
    password: string;
}

const initialState: LoginState = {
    isLoggedIn: false,
    loggedInUser:"",
    username:"",
    password:"",
    refreshAttempts:0
}

export const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        setIsLoggedIn:(state, action: PayloadAction<boolean>) => {
            state.isLoggedIn = action.payload;
        },
        setLoggedInUser:(state, action: PayloadAction<string>) => {
            state.loggedInUser = action.payload;
        },
        setUsername:(state, action: PayloadAction<string>) => {
            state.username = action.payload;
        },
        setPassword:(state, action: PayloadAction<string>) => {
            state.password = action.payload;
        },
        setRefreshAttempts:(state, action: PayloadAction<number>) => {
            state.refreshAttempts = action.payload;
        },
    }
});

export const {
    setIsLoggedIn,
    setLoggedInUser,
    setUsername,
    setPassword,
    setRefreshAttempts
} = loginSlice.actions;

export const selectIsLoggedIn = (state: RootState) => state.login.isLoggedIn;
export const selectLoggedInUser = (state: RootState) => state.login.loggedInUser;
export const selectUsername = (state: RootState) => state.login.username;
export const selectPassword = (state: RootState) => state.login.password;
export const selectRefreshAttempts = (state: RootState) => state.login.refreshAttempts;



export default loginSlice.reducer;