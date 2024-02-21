import { CircularProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectIsBuffering, setIsBuffering } from "../../features/videoPlayer/videoPlayerSlice";
import { useEffect } from "react";
import eventEmitter from "./utils/eventEmitter";

interface VideoLoaderAnimationProps {
    src: string;
    videoElement: HTMLVideoElement;
}

const VideoLoaderAnimation = ({ src, videoElement }: VideoLoaderAnimationProps) => {
    const isBuffering = useAppSelector(selectIsBuffering);
    const dispatch = useAppDispatch();

    useEffect(() => {
        function progressHandler() {
            if (videoElement.readyState === 4) {
                dispatch(setIsBuffering(false));
            }
        }
        const listener = eventEmitter.addListener('progress', progressHandler);
        return () => {
            listener.remove();
        }
    }, [src]);

    useEffect(() => {
        function loadeddataHandler() {
            dispatch(setIsBuffering(true));
        }
        const listener = eventEmitter.addListener('waiting', loadeddataHandler);
        return () => {
            listener.remove();
        }
    }, [src])

    return (
        <>
            {
                isBuffering && <CircularProgress sx={{color:"white"}} size={100} />
            }
        </>
    )
}

export default VideoLoaderAnimation;