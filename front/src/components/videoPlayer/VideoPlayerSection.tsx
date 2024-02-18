import { Typography, Box, Paper, Button, ButtonGroup } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCurrentTime, selectSelectedVideoSize, selectVideoId, setCurrentTime, setSelectedVideoSize } from '../../features/video/videoSlice';
import { useMemo, useRef } from 'react';
import { AppConfig } from '../../app/config/config';
import { selectSizes } from '../features/transcode/transcodeSlice';

const VideoPlayerSection = () => {
  const videoId = useAppSelector(selectVideoId);
  const selectedSize = useAppSelector(selectSelectedVideoSize);
  const currentTime = useAppSelector(selectCurrentTime);
  const sizes = useAppSelector(selectSizes);
  const mediaRef = useRef<HTMLVideoElement>(null);

  const baseURL = AppConfig.API.baseURL;

  const getVideoURL = (videoId: number, selectedSize: number) => {
    return `${baseURL}/video/stream/${videoId}/${selectedSize}`
  }

  const videoURL = useMemo(() => getVideoURL(videoId, selectedSize), [videoId, selectedSize]);
  const dispatch = useAppDispatch();

  const handleSizeChange = (size: string) => {
    dispatch(setSelectedVideoSize(Number(size)));
  }

  const buttons = sizes.map(size => {
    return <Button onClick={()=>handleSizeChange(size)} key={size}>{`${size}p`}</Button>
  })


  const handleTimeUpdate = () => {
    const currentTime = mediaRef.current?.currentTime || 0;
    if(currentTime > 0){
      dispatch(setCurrentTime(currentTime));
    }
    
  }

  const handleLoadVideo = () => {
    console.log("handleLoadVideo");
    if(mediaRef.current){
      mediaRef.current.currentTime = currentTime;
      mediaRef.current.play();
    }
  }

  return (
    videoId <= 0 ? <></> :

    <Paper>
      <Box sx={{ px: 4, py: 2, mb:2 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Video
        </Typography>
        <Box sx={{ border: 1, borderColor: "beige", display: "flex", flexDirection:"column", width:"100%" }}>
          <video onLoadedData={() => handleLoadVideo()} onTimeUpdate={() => handleTimeUpdate()} ref={mediaRef} id="videoPlayer" width="100%" src={videoURL} controls muted={true} controlsList="nodownload">
            <source src={videoURL} type="video/mp4" />
          </video>
          <Box sx={{backgroundColor:'black', pl:2}}>
            <ButtonGroup variant="text" size="small" aria-label="small button group">
              {buttons}
            </ButtonGroup>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

export default VideoPlayerSection;