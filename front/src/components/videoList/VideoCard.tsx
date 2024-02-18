import { Card, CardActionArea, CardMedia, CardContent, Typography } from "@mui/material";
import { useMemo } from "react";
import { useAppDispatch } from "../../app/hooks";
import { clearVideoData, setVideo } from "../../features/video/videoSlice";
import { VideoResponse, VideoMetadata } from "../../features/videoList/videoListSlice.model";

export const VideoCard = ({ video }: { video: VideoResponse }) => {

    const dispatch = useAppDispatch();

    const handleSelectedVideo = (video: VideoResponse) => {
        //TODO: show error message for videos without a valid src
        dispatch(clearVideoData());
        dispatch(setVideo(video));
    }

    const memoDuration = useMemo(() => getDuration(video.metadata), [video]);

    const imageURL = `${video.thumbnail}`;

    return (
        <Card sx={{ mb: 2, position: "relative" }} key={video.id}>
            <CardActionArea onClick={() => handleSelectedVideo(video)}>
                <CardMedia
                    component="img"
                    height="100%"
                    image={imageURL}
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