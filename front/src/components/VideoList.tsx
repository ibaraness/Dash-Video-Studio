import { Card, CardActionArea, CardHeader, Typography, CardMedia, Box, CardContent, Paper } from "@mui/material";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
interface VideoResponse {
    id: number;
    name: string;
    thumbnail: string;
    metadata: VideoMetadata;
    transcodeSizes: string[]
}

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setVideoMetadata, setVideoId, clearVideoData, VideoMetadata } from "../features/video/videoSlice";
import { resetTrascodeData, setTranscodePart, setTranscodeSize } from "../features/transcode/transcodeSlice";
import { UploadedStatus, setVideoUploadStatus } from "../features/videoUpload/videoUploadSlice";
import { selectAllVideos, useGetVideosQuery } from "../features/videoList/videoListSlice";
import { useMemo } from "react";

export const VideoList = () => {

    // Load video list
    useGetVideosQuery(undefined)

    const videos = useAppSelector(selectAllVideos)

    // TODO: Move to useMemo() to avoid recalculation
    const cards = videos.map(video => {
        return (
            <VideoCard key={video.id} video={video}></VideoCard>
        )
    })

    return (
        <Box sx={{ pb: 4, px: 6, maxHeight: "100vh", overflow: "auto" }}>
            {cards}
        </Box>
    )
}


export const VideoCard = ({ video }: { video: VideoResponse }) => {

    const dispatch = useAppDispatch();

    const handleSelectedVideo = (video: VideoResponse) => {
        console.log("video", video);

        dispatch(clearVideoData());
        // Set video as selected
        dispatch(setVideoId(video.id));

        // Hide upload section
        dispatch(setVideoUploadStatus(UploadedStatus.Complete));

        // Show which resolution already exist, so not to transcode them again
        dispatch(resetTrascodeData());
        if (video.transcodeSizes.length) {
            video.transcodeSizes.forEach(size => {
                dispatch(setTranscodePart({
                    size: String(size),
                    transcodePart: { percent: 100, status: "done" }
                }));
                dispatch(setTranscodeSize(size));
            })
        }

        // Show data about the video (metadata, title, description, etc.)
        dispatch(setVideoMetadata(video.metadata));
    }

    const memoDuration = useMemo(() => getDuration(video.metadata), [video]);

    return (
        <Card sx={{ mb: 2, position: "relative" }} key={video.id}>
            <CardActionArea onClick={() => handleSelectedVideo(video)}>
                <CardMedia
                    component="img"
                    height="100%"
                    image={`http://localhost:3000/video/image/${video.id}`}
                    alt={`${video.name}`}
                />
                <CardContent sx={{
                    px: 2,
                    py: 1,
                }}>
                    <Typography
                        title={`${video.name} (${video.id})`}
                        gutterBottom
                        variant="subtitle1"
                        whiteSpace={"nowrap"}
                        overflow={"hidden"}
                        textOverflow={"ellipsis"}
                        textTransform={"capitalize"}
                        component="div">
                        {`${video.name} (${video.id})`}
                    </Typography>
                    <Typography
                        position={"absolute"}
                        top={"5px"}
                        left={"10px"}
                        color={"white"}
                        sx={{textShadow:"0 0 5px black"}}
                        variant="subtitle1"
                        component="div">
                        {memoDuration}
                    </Typography>
                    {/* <Typography variant="body2" color="text.secondary">
                        Lizards are a widespread group of squamate reptiles, with over 6,000
                        species, ranging across all continents except Antarctica
                    </Typography> */}
                    {/* <PlayCircleOutlineIcon fontSize="large" sx={{
                        position:"absolute", 
                        top:"50%", 
                        left:"50%", 
                        transform:"translate(-50%,-100%)",
                        color:"white"}}></PlayCircleOutlineIcon> */}
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

const getDuration = ({ duration }: VideoMetadata) => {
    const rest = duration % 60;
    const minutes = (duration - rest) / 60;
    const seconds = Math.trunc(rest);
    const time = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    return time;
}