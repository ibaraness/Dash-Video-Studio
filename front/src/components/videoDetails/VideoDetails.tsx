import { Box, Stack, Typography, IconButton, Button } from "@mui/material"
import EditIcon from '@mui/icons-material/Edit';
import { selectVideoDescription, selectVideoName, selectVideoMode, setVideoMode, selectVideoId } from "../../features/video/videoSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import VideoDetailsForm from "./VideoDetailsForm";
import { setUploadMode } from "../../features/videoUpload/videoUploadSlice";

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const VideoDetails = () => {
    const videoName = useAppSelector(selectVideoName);
    const videoId = useAppSelector(selectVideoId);
    const videoDescription = useAppSelector(selectVideoDescription);
    const mode = useAppSelector(selectVideoMode);
    const dispatch = useAppDispatch();

    const setEditMode = () => {
        dispatch(setVideoMode("edit"));
    }

    const showUpload = () => {
        dispatch(setUploadMode("active"))
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
                                        disabled={!(!!videoId)}
                                        sx={{ borderRadius: 2 }}
                                        startIcon={<EditIcon></EditIcon>}
                                        onClick={() => { setEditMode() }}
                                        variant="outlined">Edit</Button>
                                    <Button
                                        size="small"
                                        disabled={!(!!videoId)}
                                        sx={{ borderRadius: 2 }}
                                        startIcon={<DeleteIcon></DeleteIcon>}
                                        onClick={() => { }}
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