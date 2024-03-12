// MUI direct checked
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { VideoCard } from "./VideoCard";
import { useEffect, useRef } from "react";
import { addAllVideos, fetchVideos, selectAllVideos, selectListLoadingState } from "../../features/videoList/videoListsSlice";
import { setMessage, setOpen, setSeverity } from "../../features/notification/notificationSlice";

export const VideoList = () => {

    const dispatch = useAppDispatch();

    const videos = useAppSelector(selectAllVideos)
    const loadingState = useAppSelector(selectListLoadingState);
    const initialized = useRef(false);
    // const [isLoading, setIsLoading] = useState(false);    

    useEffect(() => {
        const failureNotification = (message = "Something went wrong!") => {
            dispatch(setMessage(message));
            dispatch(setSeverity("error"));
            dispatch(setOpen(true));
        }
        async function loadVideos() {
            try {
                const res = await dispatch(fetchVideos()).unwrap();
                dispatch(addAllVideos(res || []));
            } catch (e) {
                if(typeof e === "object"){
                   const errorWithMessage = {message:"Something went wrong!", ...e};
                   failureNotification(errorWithMessage.message);
                   return;
                }
                failureNotification();
                console.error(e);
            }
        }
        if (!initialized.current) {
            initialized.current = true;
            loadVideos();
        }
        // State to trigger change in initialized
    }, [videos, dispatch]);

    

    const cards = videos.map(videoResponse => {
        return (
            <VideoCard key={videoResponse.id} video={videoResponse}></VideoCard>
        )
    });

    return (
        <Paper sx={{ mx: { md: 2 }, borderRadius: { xs: 0, md: 1 }, py: 3, minHeight: "100vh" }}>
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Box sx={{ pb: 4, px: { md: 3 }, maxHeight: { md: "100vh" }, overflow: { md: "auto" } }}>
                    {loadingState === "loading" ? <CardsSkeletons /> : cards}
                </Box>
            </Box>
        </Paper>
    )
}

export const CardsSkeletons = () => {
    return (
        <Box>
            <Box sx={{ mb: 5 }}>
                <Skeleton variant="rectangular" style={{ aspectRatio: "16/9", width: "100%", height: "100%" }} />
                <Box sx={{ pt: 0.5 }}>
                    <Skeleton />
                    <Skeleton width="60%" />
                </Box>
            </Box>
            <Box sx={{ mb: 5 }}>
                <Skeleton variant="rectangular" style={{ aspectRatio: "16/9", width: "100%", height: "100%" }} />
                <Box sx={{ pt: 0.5 }}>
                    <Skeleton />
                    <Skeleton width="60%" />
                </Box>
            </Box>
        </Box>
    )
}