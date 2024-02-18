import { Box, Typography } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { parseSecondsToTimeString } from "./utils/utils";

export interface VideoTimerProps {
    video: HTMLVideoElement;
    src: string;
}


const VideoTimer = ({ video: videoElement, src }: VideoTimerProps) => {

    const [parsedTime, setParsedTime] = useState<string>("00:00");
    const [videoDuration, setVideoDuration] = useState<string>("00:00");

    const interval = useRef<any>(null);
    const count = useRef<number>(0);

    useEffect(() => {
        // Wait until video duration will be clear
        const totalDuration = videoElement.duration;
        if (!isNaN(totalDuration)) {
            setVideoDuration(parseSecondsToTimeString(totalDuration));
        }
    })

    useEffect(() => {
        function playHandler() {
            interval.current = setInterval(setTimer, 1000);
            updateProgress();
        }

        function pauseHandler() {
            updateProgress();
            if (interval.current) {
                clearInterval(interval.current);
            }
        }

        function updateProgress() {
            setParsedTime(parseSecondsToTimeString(videoElement.currentTime));
        }

        function setTimer() {
            count.current += 1;
            setParsedTime(parseSecondsToTimeString(videoElement.currentTime));
        }
        videoElement.addEventListener("play", playHandler);
        videoElement.addEventListener("pause", pauseHandler);
        return () => {
            videoElement.removeEventListener("play", playHandler);
            videoElement.removeEventListener("pause", pauseHandler);
        }
    }, [src, videoDuration])

    return (
        <Box sx={{ px: 2 }}>
            <Typography variant='h6' component={"span"} color={"white"}>
                {parsedTime}
                / {videoDuration}
            </Typography>
        </Box>
    )
}

export default VideoTimer;