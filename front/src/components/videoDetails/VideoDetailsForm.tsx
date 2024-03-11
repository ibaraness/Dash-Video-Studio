import { Stack, TextField, Button, Box, CircularProgress } from "@mui/material";
import { selectVideoDescription, selectVideoId, selectVideoMode, selectVideoName, setVideoDescription, setVideoMode, setVideoName } from "../../features/video/videoSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setMessage, setOpen, setSeverity } from "../../features/notification/notificationSlice";
import { isFetchBaseQueryError } from "../../services/helpers";
import { editVideo, getAllVideos } from "../../services/restApi/restAPI";
import { addAllVideos } from "../../features/videoList/videoListsSlice";

const VideoDetailsForm = () => {

    const videoId = useAppSelector(selectVideoId);
    const videoName = useAppSelector(selectVideoName);
    const videoDescription = useAppSelector(selectVideoDescription);
    const mode = useAppSelector(selectVideoMode);
    const dispatch = useAppDispatch();

    const handleVideoName = (name: string) => {
        dispatch(setVideoName(name));
    }

    const handleVideoDescription = (description: string) => {
        dispatch(setVideoDescription(description));
    }

    const saveChanges = async () => {
        async function loadVideos() {
            const res = await getAllVideos();
            if (res.isError) {
                console.error(res.errorMessage);
                return;
            }
            dispatch(addAllVideos(res.data!));
        }
        try {
            dispatch(setVideoMode("loading"));
            const res = await editVideo({ id: videoId, name: videoName, description: videoDescription || "" });
            console.log("res", res);
            if(res.isError){
                dispatch(setVideoMode("edit"));
                failureNotification();
                return;
            }
            await loadVideos();
            dispatch(setVideoMode("display"));
            successNotification();
        } catch (err) {
            if(isFetchBaseQueryError(err)){
                const data = err.data as {message: string[]}
                failureNotification(data.message[0] || "Unknown Error!");
            } else {
                failureNotification("Unknown Error!");
            } 
            dispatch(setVideoMode("edit"));
        }
    }

    const successNotification = () => {
        dispatch(setMessage("Successfully updated video!"));
        dispatch(setSeverity("success"));
        dispatch(setOpen(true));
    }

    const failureNotification = (message = "Something went wrong!") => {
        dispatch(setMessage(message));
        dispatch(setSeverity("error"));
        dispatch(setOpen(true));
    }

    const handleCancel = () => {
        dispatch(setVideoMode("display"));
    }

    return (
        <Stack sx={{ px: 0, py: 2, mb: 2, position: "relative" }}>
            {
                mode === "loading" && <Box sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
                    <CircularProgress />
                </Box>
            }
            <TextField
                value={videoName}
                disabled={mode === "loading"}
                onChange={(event) => handleVideoName(event.target.value)}
                sx={{ mb: 4, color: "#757575" }} label="Title" variant="standard" />
            <TextField
                sx={{ mb: 4 }}
                label="Description"
                multiline
                disabled={mode === "loading"}
                rows={4}
                value={videoDescription || ""}
                onChange={(event) => handleVideoDescription(event.target.value)}
            />
            <Stack direction={"row"} spacing={2}>
                <Button sx={{ borderRadius: 2}} size="small" disabled={mode === "loading"} variant="contained" onClick={() => { saveChanges() }}>Update</Button>
                <Button sx={{ borderRadius: 2}} size="small" disabled={mode === "loading"} variant="outlined" onClick={() => handleCancel()}>Cancel</Button>
            </Stack>

        </Stack>
    )
}

export default VideoDetailsForm;