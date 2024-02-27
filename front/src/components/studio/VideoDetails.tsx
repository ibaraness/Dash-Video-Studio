import { Box, Stack, Typography, IconButton } from "@mui/material"
import EditIcon from '@mui/icons-material/Edit';
import { selectVideoDescription, selectVideoName, selectVideoMode, setVideoMode } from "../../features/video/videoSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import VideoDetailsForm from "../VideoDetailsForm";

const VideoDetails = () => {
    const videoName = useAppSelector(selectVideoName);
    const videoDescription = useAppSelector(selectVideoDescription);
    const mode = useAppSelector(selectVideoMode);
    const dispatch = useAppDispatch();

    // const toggleEditMode = () => {
    //     dispatch(setVideoMode(mode === "display" ? "edit" : "display"));
    // }

    const setEditMode = () => {
        dispatch(setVideoMode("edit"));
    }
    return (
        <Box sx={{ m: { xs: 2, lg: 0, color: "#757575" } }}>
            {
                mode === "display"
                    ? <>
                        <Stack sx={{ my: 2 }} direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                            <Typography variant="subtitle1">
                                {videoName}
                            </Typography>
                            <IconButton onClick={() => { setEditMode() }}>
                                <EditIcon></EditIcon>
                            </IconButton>
                        </Stack>
                        <Box sx={{
                            my: 2,
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