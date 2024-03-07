import { Box } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { VideoCard } from "./VideoCard";
import { getAllVideos } from "../../services/restAPI";
import { useEffect, useRef } from "react";
import { addAllVideos, selectAllVideos } from "../../features/videoList/videoListsSlice";

export const VideoList = () => {

    // console.log("videoList", videos)
    const dispatch = useAppDispatch();

    // const videos: VideoResponse[] = []//useAppSelector(selectAllVideos);
    const videos = useAppSelector(selectAllVideos)
    const initialized = useRef(false);
    
    useEffect(() => {
        async function loadVideos() {
            const res = await getAllVideos();
            if (res.isError) {
                console.error(res.errorMessage);
                return;
            }
            dispatch(addAllVideos(res.data));
        }
        if (!initialized.current) {
            initialized.current = true;
            loadVideos();
        }
        // State to trigger change in initialized
    }, [videos, dispatch])

    // TODO: Move to useMemo() to avoid recalculation
    const cards = videos.map(videoResponse => {
        return (
            <VideoCard key={videoResponse.id} video={videoResponse}></VideoCard>
        )
    });

    return (
        <Box sx={{ pb: 4, px: { md: 6 }, maxHeight: { md: "100vh" }, overflow: { md: "auto" } }}>
            {cards}
        </Box>
    )
}


