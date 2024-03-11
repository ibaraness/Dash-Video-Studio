import { PayloadAction, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { VideoResponse } from './videoListSlice.model';
import { getAllVideos } from '../../services/restApi/restAPI';

// Create a thunk to fetch the video list
export const fetchVideos = createAsyncThunk(
    'videoLists/fetchVideos',
    async () => {
        const response = await getAllVideos()
        if(response.isError){
            throw new Error(response.errorMessage);
        }
        return response.data
    },
)

// Creating an entity adapter to normalize the user lists into
// object based collection with the users IDs as keys
const videosAdapter = createEntityAdapter<VideoResponse>();

// Generate initial state object with 'ids' and 'entities' for future entries 
const initialState = videosAdapter.getInitialState({loading:"idle", other:1});

export const videoListsSlice = createSlice({
    name: 'videoLists',
    initialState,
    reducers: {
        addOneVideo: videosAdapter.addOne,
        addAllVideos: (state, action: PayloadAction<VideoResponse[]>) => {
            videosAdapter.setAll(state, action.payload);
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchVideos.fulfilled, (state) => {
            state.loading = "success";
        });
        builder.addCase(fetchVideos.pending, (state) => {
            state.loading = "loading";
        });
        builder.addCase(fetchVideos.rejected, (state) => {
            state.loading = "failed";
        });
    }
});

export const selectVideoLists = (state: RootState) => state.videoLists;

export const { addAllVideos, addOneVideo } = videoListsSlice.actions;

// // Export all user list related selectors
export const { selectAll: selectAllVideos, selectById: selectVideoById } =
    videosAdapter.getSelectors((state: RootState) => selectVideoLists(state) ?? initialState);
export const selectListLoadingState = (state: RootState) => state.videoLists.loading;

export default videoListsSlice.reducer;