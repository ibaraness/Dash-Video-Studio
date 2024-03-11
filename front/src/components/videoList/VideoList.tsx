import { Box, IconButton, Paper, Skeleton } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { VideoCard } from "./VideoCard";
import { getAllVideos } from "../../services/restApi/restAPI";
import { useEffect, useRef } from "react";
import { addAllVideos, selectAllVideos } from "../../features/videoList/videoListsSlice";
import RefreshIcon from '@mui/icons-material/Refresh';

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
            dispatch(addAllVideos(res.data!));
        }
        if (!initialized.current) {
            initialized.current = true;
            loadVideos();
        }
        // State to trigger change in initialized
    }, [videos, dispatch])

    const cards = videos.map(videoResponse => {
        return (
            <VideoCard key={videoResponse.id} video={videoResponse}></VideoCard>
        )
    });

    return (
        <Paper sx={{mx: {md:2}, borderRadius:{xs:0, md:1}, py:3}}>
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Box sx={{ pb: 4, px: { md: 3 }, maxHeight: { md: "100vh" }, overflow: { md: "auto" } }}>
                    {/* <Skeleton variant="rectangular" width={210} height={118} /> */}
                    {cards}
                </Box>
            </Box>
        </Paper>


    )
}


