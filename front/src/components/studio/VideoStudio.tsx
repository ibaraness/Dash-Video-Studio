import { Grid, Box, Paper, Button, Typography, Stack } from "@mui/material"
import { selectPercent, selectTranscodePercent, setIsConectedToServer, setPercent, setTranscodePercent, setVideoInputValue } from "../../features/videoUpload/videoUploadSlice"
import LinearProgressWithLabel from "../LinearProgressWithLabel"
import InputFileUpload from "../UploadButton"
import { VideoList } from "../videoList/VideoList"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import DashPlayer from "../DashPlayer/DashPlayer"
import { useEffect } from "react"
import { selectAllVideos, selectVideoById, useGetVideosQuery } from "../../features/videoList/videoListSlice"
import { socket } from "../../sockets/socket"
import { selectFallbackURL, setVideo } from "../../features/video/videoSlice"
import { VideoResponse } from "../../features/videoList/videoListSlice.model"
import { VideoJSContainer } from "../VideoJs/VideoJS"

interface TranscodeResponse {
    status: string;
    percentage: number;
    size: number;
}

const VideoStudio = () => {
    const percent = useAppSelector(selectPercent);
    const transcodePercentage = useAppSelector(selectTranscodePercent);
    const videos = useAppSelector(selectAllVideos);
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

        socket.on('videoUpdated', async (data) => {
            await refetch();
            console.log("videoUpdated", data);
            dispatch(setVideo(data));
        })

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };

    }, []);

    const handleClearForm = () => {
        dispatch(setPercent(0));
        dispatch(setVideoInputValue(""));
    }

    return (
        <Grid container>
            <Grid item lg={8} xs={12}>
                <Box sx={{ mb: 4 }}>
                    {/* Dash Player */}
                    <Paper>
                        <Box sx={{ px: {lg:4, xs:0}, py: {lg:2, xs:0}, mb: 2 }}>
                            <DashPlayer></DashPlayer>
                        </Box>
                    </Paper>
                    <Paper>
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
                            <Box sx={{  py: 2, mb: 2 }}>
                                Dash Transcode progress
                                <LinearProgressWithLabel color="secondary" value={transcodePercentage ?? 0} />
                            </Box>
                        </Box>
                    </Paper>

                    {/* <Paper>
                        <Box sx={{ px: 4, py: 2, mb: 2 }}>
                            Dash Transcode progress
                            <LinearProgressWithLabel color="secondary" value={transcodePercentage ?? 0} />
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