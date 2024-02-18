import { Box } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import { selectAllVideos, useGetVideosQuery } from "../../features/videoList/videoListSlice";
import { VideoCard } from "./VideoCard";

export const VideoList = () => {

    // Load video list
    useGetVideosQuery(undefined)

    const videos = useAppSelector(selectAllVideos)

    // TODO: Move to useMemo() to avoid recalculation
    const cards = videos.map(videoResponse => {
        return (
            <VideoCard key={videoResponse.id} video={videoResponse}></VideoCard>
        )
    })

    return (
        <Box sx={{ pb: 4, px: {lg:6}, maxHeight:{lg: "100vh"}, overflow: {lg:"auto"} }}>
            {cards}
        </Box>
    )
}


