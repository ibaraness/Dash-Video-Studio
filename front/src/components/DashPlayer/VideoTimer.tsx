// MUI direct checked
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useEffect, useRef } from "react";
import { parseSecondsToTimeString } from "./utils/general-utils";
import eventEmitter from "./utils/eventEmitter";
import { VideoEvent } from "./hooks/useVideoEventEmitter";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectParsedTime, selectVideoDuration, setParsedTime, setVideoDuration } from "../../features/videoPlayer/videoPlayerSlice";

export interface VideoTimerProps {
    video: HTMLVideoElement;
    src: string;
}


const VideoTimer = ({ video: videoElement, src }: VideoTimerProps) => {

    const parsedTime = useAppSelector(selectParsedTime);

    const videoDuration = useAppSelector(selectVideoDuration);

    const dispatch = useAppDispatch();

    const initialized = useRef(false);

    useEffect(() => {
        if(!initialized.current){
            // Wait until video duration will be clear
            const totalDuration = videoElement.duration;
            if (!isNaN(totalDuration)) {
                initialized.current = true;
                dispatch(setVideoDuration(parseSecondsToTimeString(totalDuration)));
            }
        }
    });

    

    useEffect(()=>{
        function timeUpdate(){
            dispatch(setParsedTime(parseSecondsToTimeString(videoElement.currentTime)));
        }
        const listener = eventEmitter.addListener(VideoEvent.TimeUpdate, timeUpdate)
        return () => {
            listener.remove();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[src])

    return (
        <Box sx={{ px: 2 }}>
            <Typography sx={{ typography: {sm:'body2', xs:'body1'}, 'whiteSpace':"nowrap"}} component={"span"} color={"white"}>
                {parsedTime}
                / {videoDuration}
            </Typography>
        </Box>
    )
}

export default VideoTimer;