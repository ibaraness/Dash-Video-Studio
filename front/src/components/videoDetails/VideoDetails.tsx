import { Box, Stack, Typography, Button } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { selectVideoDescription, selectVideoName, selectVideoMode, setVideoMode, selectVideoId, clearVideoData } from "../../features/video/videoSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import VideoDetailsForm from "./VideoDetailsForm";
import { setUploadMode } from "../../features/videoUpload/videoUploadSlice";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { setConfirmAction, setConfirmCallId, setConfirmMessage, setConfirmOpen, setConfirmTitle } from "../../features/confirm/confirmSlice";
import { useEffect } from "react";
import eventEmitter from "../DashPlayer/utils/eventEmitter";
import { ConfirmResponse } from "../confirm/ConfirmDialog";
import { setMessage, setOpen, setSeverity } from "../../features/notification/notificationSlice";
import { deleteAVideo, getAllVideos } from "../../services/restAPI";
import { addAllVideos } from "../../features/videoList/videoListsSlice";

const VideoDetails = () => {
    const videoName = useAppSelector(selectVideoName);
    const videoId = useAppSelector(selectVideoId);
    const videoDescription = useAppSelector(selectVideoDescription);
    const mode = useAppSelector(selectVideoMode);
    const dispatch = useAppDispatch();

    useEffect(() => {
        async function deleteConfirmation({ action, id, approved }: ConfirmResponse) {
            async function loadVideos() {
                const res = await getAllVideos();
                if (res.isError) {
                    console.error(res.errorMessage);
                    return;
                }
                dispatch(addAllVideos(res.data));
            }
            try {
                if (approved && action === 'delete') {
                    const res = await deleteAVideo(id);
                    if(res.isError){
                        console.error("error", res.errorMessage);
                        failureNotification();
                        return;
                    }
                    successNotification();
                    dispatch(clearVideoData());
                    await loadVideos();
                }
            } catch (err) {
                console.error(err);
                failureNotification();
            }

        }
        const listener = eventEmitter.addListener('confirmAnswer', deleteConfirmation);
        return () => {
            listener.remove();
        }
    })

    const successNotification = () => {
        dispatch(setMessage("Successfully deleted video!"));
        dispatch(setSeverity("success"));
        dispatch(setOpen(true));
    }

    const failureNotification = (message = "Something went wrong!") => {
        dispatch(setMessage(message));
        dispatch(setSeverity("error"));
        dispatch(setOpen(true));
    }

    const setEditMode = () => {
        dispatch(setVideoMode("edit"));
    }

    const showUpload = () => {
        dispatch(setUploadMode("active"))
    }

    const handleDelete = () => {
        dispatch(setConfirmCallId(videoId));
        dispatch(setConfirmAction("delete"));
        dispatch(setConfirmTitle("Are you sure want to delete this video?"));
        dispatch(setConfirmMessage("This operation is irreversible, all of the video's data will be lost! "));
        dispatch(setConfirmOpen(true));
    }

    return (
        <Box sx={{ mx: { xs: 2, lg: 0, color: "#757575" } }}>
            {
                mode === "display"
                    ? <>
                        <Stack sx={{
                            my: 2,
                            flexDirection: { xs: "column", md: "row" }
                        }}
                            alignItems={"center"}
                            justifyContent={"space-between"}
                        >
                            <Typography sx={{
                                width: "100%",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                mr: 1,
                                mb: 1,
                                opacity: videoName ? 1 : 0
                            }} variant="subtitle1">
                                {videoName || "Video Title"}
                            </Typography>

                            <Stack sx={{ width: { xs: "100%", md: "auto" } }} direction={"row"} spacing={1} justifyContent={"space-between"}>

                                <Button
                                    size="small"
                                    sx={{ borderRadius: 2 }}
                                    startIcon={<AddIcon></AddIcon>}
                                    onClick={() => { showUpload() }}
                                    variant="contained">New</Button>
                                <Stack direction={"row"} spacing={1}>
                                    <Button
                                        size="small"
                                        disabled={!videoId}
                                        sx={{ borderRadius: 2 }}
                                        startIcon={<EditIcon></EditIcon>}
                                        onClick={() => { setEditMode() }}
                                        variant="outlined">Edit</Button>
                                    <Button
                                        size="small"
                                        disabled={!videoId}
                                        sx={{ borderRadius: 2 }}
                                        startIcon={<DeleteIcon></DeleteIcon>}
                                        onClick={() => { handleDelete() }}
                                        variant="outlined">Delete</Button>
                                </Stack>

                            </Stack>

                        </Stack>
                        <Box sx={{
                            my: 2,
                            display: { xs: "none", md: "block" },
                            border: "1px solid #e0e0e0",
                            borderRadius: "4px",
                            p: 2,
                            height: "150px"
                        }}>
                            <Typography variant="body1">
                                {videoDescription || "No description for this video"}
                            </Typography>
                        </Box>

                    </>
                    : <VideoDetailsForm></VideoDetailsForm>
            }

        </Box>
    )
}

export default VideoDetails;