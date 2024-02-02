import { Typography, Box, Container, Button, Stack, Paper, Grid, Card, CardHeader, CardContent, CardMedia, CardActionArea } from '@mui/material';
import { blue } from '@mui/material/colors';
import InputFileUpload from './components/UploadButton';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { UploadedStatus, selectPercent, selectVideoUploadStatus, setPercent, setVideoInputValue, setVideoUploadStatus } from './features/videoUpload/videoUploadSlice';
import LinearProgressWithLabel from './components/LinearProgressWithLabel';
import VideoPlayer from './components/VideoPlayer';
import { useState, useEffect } from 'react';
import { socket } from './sockets/socket';
import { ConnectionState } from './components/sockets/ConnectionState';
import { Events } from './components/sockets/Events';
import { ConnectionManager } from './components/sockets/ConnectionManager';
import { MyForm } from './components/sockets/MyForm';
import { resetTrascodeData, selectIsConnected, selectSizes, selectTranscodeSize, setIsConnected, setTranscodePart, setTranscodeSize } from './features/transcode/transcodeSlice';
import { RootState } from './store/store';
import { selectVideoId, setVideoId } from './features/video/videoSlice';
import { TranscodeButtons } from './components/TranscodeButtons';
import { VideoList } from './components/VideoList';


// {status, percentage, size}
interface TranscodeResponse {
  status: string;
  percentage: number;
  size: number;
}

function App() {

  const percent = useAppSelector(selectPercent);
  const isConnected = useAppSelector(selectIsConnected);
  const videoUploadStatus = useAppSelector(selectVideoUploadStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    function onConnect() {
      dispatch(setIsConnected(true));
    }

    function onDisconnect() {
      dispatch(setIsConnected(false));
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('transcode', (value: TranscodeResponse) => {
      dispatch(setTranscodePart({
        size: String(value.size),
        transcodePart: { percent: value.percentage, status: value.status }
      }));
      dispatch(setTranscodeSize(String(value.size)));
    })

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleClearForm = () => {
    dispatch(setPercent(0));
    dispatch(setVideoInputValue(""));
    console.log("clearing form!");
  }

  const handleUploadNewVideo = () => {
    dispatch(setVideoInputValue(""));
    dispatch(setVideoUploadStatus(UploadedStatus.Idle));
    dispatch(setVideoId(0));
    dispatch(resetTrascodeData());
  }

  return (
    <Container maxWidth="lg" sx={{ backgroundColor: blue[50], minHeight: "100vh", py: 4 }}>
      <Grid container>
        <Grid item xs={8}>
          <Box sx={{ mb: 4 }}>
            {
              videoUploadStatus === UploadedStatus.Complete &&
              <Paper>
                <Box sx={{ px: 4, py: 2, mb: 2 }}>
                  <Button onClick={() => handleUploadNewVideo()} >Upload a new video</Button>
                </Box>
              </Paper>
            }

            <VideoPlayer></VideoPlayer>

            {
              videoUploadStatus !== UploadedStatus.Complete &&
              <Paper>
                <Box sx={{ px: 4, py: 2, mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Upload original video {isConnected && "(connected to service)"}
                  </Typography>
                  <Stack sx={{ mt: 4 }} direction={"row"} spacing={2}>
                    <InputFileUpload />
                    <Button variant="outlined" onClick={() => handleClearForm()}>Clear</Button>
                  </Stack>
                  <Box sx={{ width: '100%', mt: 4 }}>
                    <LinearProgressWithLabel value={percent} />
                  </Box>
                </Box>
              </Paper>
            }

            <TranscodeButtons></TranscodeButtons>

          </Box>
        </Grid>
        <Grid item xs={4}>
          <VideoList></VideoList>
        </Grid>
      </Grid>

    </Container>
  )
}

export default App


