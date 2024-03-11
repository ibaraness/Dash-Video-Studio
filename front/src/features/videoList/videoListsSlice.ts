import { PayloadAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { VideoResponse } from '../../services/restApi/restAPI';

// Creating an entity adapter to normalize the user lists into
// object based collection with the users IDs as keys
const videosAdapter = createEntityAdapter<VideoResponse>();

// Generate initial state object with 'ids' and 'entities' for future entries 
const initialState = videosAdapter.getInitialState();

export const videoListsSlice = createSlice({
    name: 'videoLists',
    initialState: videosAdapter.getInitialState(),
    reducers:{
        addOneVideo:videosAdapter.addOne,
        addAllVideos:(state, action: PayloadAction<VideoResponse[]>) => {
            videosAdapter.setAll(state, action.payload);
        }
    }
});

export const selectVideoLists = (state: RootState) => state.videoLists;

export const {addAllVideos, addOneVideo} = videoListsSlice.actions;

// // Export all user list related selectors
export const { selectAll: selectAllVideos, selectById: selectVideoById } =
    videosAdapter.getSelectors((state:RootState) => selectVideoLists(state) ?? initialState);


export default videoListsSlice.reducer;