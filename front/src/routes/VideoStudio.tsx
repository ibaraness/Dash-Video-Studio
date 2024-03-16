// MUI direct checked
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"

import { selectPercent, selectTranscodePercent, selectUploadMode, setIsConectedToServer, setPercent, setTranscodePercent, setUploadMode } from "../features/videoUpload/videoUploadSlice"
import LinearProgressWithLabel from "../components/LinearProgressWithLabel"
import InputFileUpload from "../components/UploadButton"
import { VideoList } from "../components/videoList/VideoList"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { useEffect, useRef } from "react"
import { socket } from "../sockets/socket"
import { selectDashURL, setVideo, setVideoMode } from "../features/video/videoSlice"
import VideoDetails from "../components/videoDetails/VideoDetails"
import { VideoResponse } from "../features/videoList/videoListSlice.model"
import { selectIsMobile, selectTopMenuHeight, selectTopOffset, setTopOffset } from "../features/ui/uiSlice"
import { addAllVideos, fetchVideos } from "../features/videoList/videoListsSlice"
import { setMessage, setOpen, setSeverity } from "../features/notification/notificationSlice"
import { DashPlayer } from 'dash-studio-player'

import eventEmitter from "../app/utils/eventEmitter"


interface TranscodeResponse {
    status: string;
    percentage: number;
    size: number;
}

export const VideoStudio = () => {
    const percent = useAppSelector(selectPercent);
    const transcodePercentage = useAppSelector(selectTranscodePercent);
    const uploadMode = useAppSelector(selectUploadMode);
    const playerContainer = useRef<HTMLDivElement>(null);
    const topOffset = useAppSelector(selectTopOffset);
    const isMobile = useAppSelector(selectIsMobile);
    const dispatch = useAppDispatch();

    const topMenuOffset = useAppSelector(selectTopMenuHeight);

    const mpdSrc = useAppSelector(selectDashURL);

    useEffect(() => {
        socket.connect();
        return () =>{
            socket.disconnect();
        }
    },[]);

    useEffect(() => {
        function onConnect() {
            dispatch(setIsConectedToServer(true));
        }

        function onDisconnect() {
            dispatch(setIsConectedToServer(false));
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        return ()=>{
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        }
    })

    useEffect(() => {
        const OnPackageTrascode = (value: TranscodeResponse) => {
            dispatch(setTranscodePercent(+value.percentage));
        }

        const onVideoUpdated = async (data: VideoResponse) => {
            async function loadVideos() {
                try {
                    const res = await dispatch(fetchVideos()).unwrap();
                    dispatch(addAllVideos(res || []));
                } catch (e) {
                    if(typeof e === "object"){
                       const errorWithMessage = {message:"Something went wrong!", ...e};
                       failureNotification(errorWithMessage.message);
                       return;
                    }
                    failureNotification();
                    console.error(e);
                }
            }
            await loadVideos();
            dispatch(setUploadMode("inactive"));
            dispatch(setVideo(data));
            dispatch(setVideoMode("edit"));
        }

        const failureNotification = (message = "Something went wrong!") => {
            dispatch(setMessage(message));
            dispatch(setSeverity("error"));
            dispatch(setOpen(true));
        }

        socket.on('packageTranscode', OnPackageTrascode);
        socket.on('videoUpdated', onVideoUpdated);

        return () => {
            socket.off('packageTranscode', OnPackageTrascode);
            socket.off('videoUpdated', onVideoUpdated);
        };
    },[dispatch]);

    const handleClearForm = () => {
        dispatch(setPercent(0));
        dispatch(setUploadMode("inactive"));
    }

    useEffect(() => {
        if (playerContainer.current) {
            dispatch(setTopOffset(playerContainer.current.offsetHeight));
        }
        function handleResize() {
            if (playerContainer.current) {
                dispatch(setTopOffset(playerContainer.current.offsetHeight));
            }
        }
        const listener = eventEmitter.addListener("resize", handleResize);
        return () => {
            listener.remove();
        }
    }, [playerContainer, dispatch, topMenuOffset])

    return (
        <Grid sx={{pt:`${isMobile && (topOffset + topMenuOffset) + 'px' || 0}`}} container>
            <Grid item md={8} xs={12}>
                <Box ref={playerContainer} sx={{
                    mb: 4,
                    position: { xs: "fixed", md: "static" },
                    top: topMenuOffset + "px",
                    left: 0,
                    right: 0,
                    zIndex: { xs: "9", md: "1" }
                }} component={"div"}>
                    {/* Dash Player */}
                    {
                        uploadMode === "inactive"
                            ? <Paper sx={{
                                px: { md: 4, xs: 0 },
                                py: { md: 3, xs: 0 },
                                mb: 2,

                            }}>
                                <Stack >
                                    {
                                        mpdSrc 
                                        ? 
                                        <DashPlayer mpdUrl={mpdSrc}></DashPlayer> 
                                        
                                        : <Box sx={{
                                            backgroundColor:"black",
                                            aspectRatio:"16 /9",
                                            width: "100%" 
                                        }}></Box>
                                    }
                                    <VideoDetails></VideoDetails>
                                </Stack>
                            </Paper>
                            : <Paper>
                                <Box sx={{ px: 4, py: 2, mb: 2 }}>
                                    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                                        Upload original video
                                    </Typography>
                                    <Stack sx={{ mt: 4 }} direction={"row"} spacing={2}>
                                        <InputFileUpload />
                                        <Button variant="outlined" onClick={() => handleClearForm()}>Cancel</Button>
                                    </Stack>
                                    <Box sx={{ width: '100%', mt: 4 }}>
                                        <LinearProgressWithLabel value={percent} />
                                    </Box>
                                    <Box sx={{ py: 2, mb: 2 }}>
                                        Dash Transcode progress
                                        <LinearProgressWithLabel color="secondary" value={transcodePercentage ?? 0} />
                                    </Box>
                                </Box>
                            </Paper>
                    }
                </Box>
            </Grid>
            <Grid item md={4} xs={12}>
                <VideoList></VideoList>
            </Grid>
        </Grid>
    )
}