import { Grid, Box, Paper, Button, Typography, Stack } from "@mui/material"
import { selectPercent, selectTranscodePercent, selectUploadMode, setIsConectedToServer, setPercent, setTranscodePercent, setUploadMode, setVideoInputValue } from "../../features/videoUpload/videoUploadSlice"
import LinearProgressWithLabel from "../LinearProgressWithLabel"
import InputFileUpload from "../UploadButton"
import { VideoList } from "../videoList/VideoList"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import DashPlayer from "../DashPlayer/DashPlayer"
import { useEffect, useRef } from "react"
import { useGetVideosQuery } from "../../features/videoList/videoListSlice"
import { socket } from "../../sockets/socket"
import { setVideo, setVideoMode } from "../../features/video/videoSlice"
import VideoDetails from "../videoDetails/VideoDetails"
import { VideoResponse } from "../../features/videoList/videoListSlice.model"
import eventEmitter from "../DashPlayer/utils/eventEmitter"
import { selectIsMobile, selectTopOffset, setTopOffset } from "../../features/ui/uiSlice"

interface TranscodeResponse {
    status: string;
    percentage: number;
    size: number;
}

const VideoStudio = () => {
    const percent = useAppSelector(selectPercent);
    const transcodePercentage = useAppSelector(selectTranscodePercent);
    const uploadMode = useAppSelector(selectUploadMode);
    const playerContainer = useRef<HTMLDivElement>(null);
    const topOffset = useAppSelector(selectTopOffset);
    const isMobile = useAppSelector(selectIsMobile);
    const dispatch = useAppDispatch();



    const { refetch } = useGetVideosQuery(undefined);

    useEffect(() => {
        function onConnect() {
            dispatch(setIsConectedToServer(true));
        }

        function onDisconnect() {
            dispatch(setIsConectedToServer(false));
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        socket.on('packageTranscode', (value: TranscodeResponse) => {
            dispatch(setTranscodePercent(+value.percentage));
        })

        socket.on('videoUpdated', async (data: VideoResponse) => {
            await refetch();
            dispatch(setUploadMode("inactive"));
            dispatch(setVideo(data));
            dispatch(setVideoMode("edit"));
        })
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };

    });

    const handleClearForm = () => {
        dispatch(setPercent(0));
        dispatch(setVideoInputValue(""));
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
    }, [playerContainer])

    return (
        <Grid sx={{pt:`${isMobile && topOffset + 'px' || 0}`}} container>
            <Grid item lg={8} xs={12}>
                <Box ref={playerContainer} sx={{
                    mb: 4,
                    position: { xs: "fixed", md: "static" },
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: { xs: "99999", md: "1" }
                }} component={"div"}>
                    {/* Dash Player */}
                    {
                        uploadMode === "inactive"
                            ? <Paper sx={{
                                px: { lg: 4, xs: 0 },
                                py: { lg: 2, xs: 0 },
                                mb: 2,

                            }}>
                                <Stack >
                                    <DashPlayer></DashPlayer>
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
                    {/* <Paper sx={{
                        px: { lg: 4, xs: 0 },
                        py: { lg: 2, xs: 0 },
                        mb: 2,
                        position: { xs: "fixed", md: "static" },
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: { xs: "99999", md: "1" }
                    }}>
                        <Stack >
                            <DashPlayer></DashPlayer>
                            <VideoDetails></VideoDetails>
                        </Stack>
                    </Paper> */}
                    {/* <UploadSection></UploadSection> */}
                    {/* <Paper>
                        <Box sx={{ px: 4, py: 2, mb: 2 }}>
                            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                                Upload original video
                            </Typography>
                            <Stack sx={{ mt: 4 }} direction={"row"} spacing={2}>
                                <InputFileUpload />
                                <Button variant="outlined" onClick={() => handleClearForm()}>Clear</Button>
                            </Stack>
                            <Box sx={{ width: '100%', mt: 4 }}>
                                <LinearProgressWithLabel value={percent} />
                            </Box>
                            <Box sx={{ py: 2, mb: 2 }}>
                                Dash Transcode progress
                                <LinearProgressWithLabel color="secondary" value={transcodePercentage ?? 0} />
                            </Box>
                        </Box>
                    </Paper> */}
                </Box>
            </Grid>
            <Grid item lg={4} xs={12}>
                <VideoList></VideoList>
            </Grid>
        </Grid>
    )
}

export default VideoStudio;