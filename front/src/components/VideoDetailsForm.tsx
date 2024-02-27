import { Stack, TextField, Button, Box, CircularProgress } from "@mui/material";
import { selectVideoDescription, selectVideoId, selectVideoMode, selectVideoName, setVideoDescription, setVideoMode, setVideoName } from "../features/video/videoSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setMessage, setOpen, setSeverity } from "../features/notification/notificationSlice";
import { useUpdateVideoMutation } from "../features/api/apiSlice";
import { useGetVideosQuery } from "../features/videoList/videoListSlice";

const VideoDetailsForm = () => {

    const videoId = useAppSelector(selectVideoId);
    const videoName = useAppSelector(selectVideoName);
    const videoDescription = useAppSelector(selectVideoDescription);
    const mode = useAppSelector(selectVideoMode);
    const dispatch = useAppDispatch();

    const [updateVideo, { isError, error }] = useUpdateVideoMutation(undefined)
    const { refetch } = useGetVideosQuery(undefined)

    const handleVideoName = (name: string) => {
        dispatch(setVideoName(name));
    }

    const handleVideoDescription = (description: string) => {
        dispatch(setVideoDescription(description));
    }

    const saveChanges = async () => {
        try {
            dispatch(setVideoMode("loading"));
            await updateVideo({ id: videoId, name: videoName, description: videoDescription || "" }).unwrap();
            if (isError) {
                failureNotification()
                return;
            }
            await refetch();
            dispatch(setVideoMode("display"));
            successNotification();
        } catch (e) {
            console.log("error", e);
            failureNotification();
            dispatch(setVideoMode("edit"));
        }

    }

    const successNotification = () => {
        dispatch(setMessage("Successfully updated video!"));
        dispatch(setSeverity("success"));
        dispatch(setOpen(true));
    }

    const failureNotification = () => {
        dispatch(setMessage(error && error.toString() || "Something went wrong!"));
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
                sx={{ mb: 4 }} label="Title" variant="standard" />
            <TextField
                sx={{ mb: 4 }}
                label="Description"
                multiline
                disabled={mode === "loading"}
                rows={4}
                value={videoDescription || ""}
                onChange={(event) => handleVideoDescription(event.target.value)}
            />
            {/* Tags */}
            {/* <Grid container sx={{ mb: 4 }} spacing={2}>
                    <Grid item xs={6}>
                        <TextField sx={{ width: "100%" }} label="Tag" variant="standard" />
                    </Grid>
                    <Grid item xs={4}>
                        <Button disabled={mode === "loading"} variant="contained">Add</Button>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 4 }}>
                    <Chip sx={{ mr: 1 }} label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                </Box> */}
            <Stack direction={"row"} spacing={2}>
                <Button disabled={mode === "loading"} variant="contained" onClick={() => { saveChanges() }}>Update</Button>
                <Button disabled={mode === "loading"} variant="outlined" onClick={() => handleCancel()}>Cancel</Button>
            </Stack>

        </Stack>
    )
}

export default VideoDetailsForm;