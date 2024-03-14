// MUI direct checked
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import { useMemo } from "react";
import { useAppDispatch } from "../../app/hooks";
import { clearVideoData, setVideo } from "../../features/video/videoSlice";
import { parseSecondsToTimeString } from "../DashPlayer/utils/general-utils";
import { VideoResponse } from "../../features/videoList/videoListSlice.model";

export const VideoCard = ({ video }: { video: VideoResponse }) => {

    const dispatch = useAppDispatch();

    const handleSelectedVideo = (video: VideoResponse) => {
        //TODO: show error message for videos without a valid src
        dispatch(clearVideoData());
        dispatch(setVideo(video));
    }

    const memoDuration = useMemo(() => parseSecondsToTimeString(video.metadata.duration), [video]);

    const imageURL = `${video.thumbnail}`;

    return (
        <Card variant="outlined" sx={{ mb: 2, position: "relative", borderRadius:{xs:0, md:1} }} key={video.id}>
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
                        {`${video.name}`}
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