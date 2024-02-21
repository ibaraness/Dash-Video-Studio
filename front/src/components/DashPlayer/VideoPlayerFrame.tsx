import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import VideoLoaderAnimation from "./VideoLoaderAnimation";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectFullScreen, selectPlaying, setFullScreen, setPlaying } from "../../features/videoPlayer/videoPlayerSlice";
import { AspectRatioAlg, setFrameAspectRatio } from "./utils/general-utils";
import useFullScreenEvent from "./hooks/useFullScreenEvent";
import { Box } from "@mui/material";
import eventEmitter from "./utils/eventEmitter";
import useThrottle from "./hooks/useThrottle";
import useDebounce from "./hooks/useDebounce";

interface VideoPlayerFrameProps extends PropsWithChildren {
    mpdSrc: string;
    videoElement: HTMLVideoElement;
}

const VideoPlayerFrame = ({ mpdSrc, videoElement, children }: VideoPlayerFrameProps) => {
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const playing = useAppSelector(selectPlaying);
    const fullScreen = useAppSelector(selectFullScreen);

    const throttle = useThrottle()

    const dispatch = useAppDispatch();

    const mousePosition = useRef<{ x: number, y: number } | null>(null);

    useEffect(() => {
        // Append video element to div container
        if (videoContainerRef.current && videoContainerRef.current.firstChild !== videoElement) {
            videoContainerRef.current.appendChild(videoElement);
            updateFrameAspectRatio(videoElement);
        }
    }, [videoContainerRef])

    // Handler window resize
    useEffect(() => {
        function handleResize() {
            if (!videoElement || !!document.fullscreenElement) {
                return;
            }
            updateFrameAspectRatio(videoElement);
        }

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    });

    // Handle fullscreen events
    const fullscreenHandler = useCallback((isFullscreen: boolean) => {
        updateFrameAspectRatio(videoElement, isFullscreen);
        dispatch(setFullScreen(isFullscreen));
    }, [fullScreen])

    useFullScreenEvent(playerContainerRef.current!, fullScreen, fullscreenHandler);

    useEffect(() => {
        // fullscreenchange
        const listener = eventEmitter.addListener("fullscreenchange", fullscreenHandler);
        return () => {
            listener.remove();
        }
    }, [fullScreen])

    const updateFrameAspectRatio = (htmlElement: HTMLElement, isFullscreen: boolean = false) => {
        if (!videoContainerRef.current) {
            return;
        }
        if (isFullscreen) {
            videoElement.style.width = "100vw";
            videoElement.style.height = "100vh";
            videoElement.style.position = "absolute";
            videoElement.style.top = '0';// `${videoElement.offsetHeight / 2}px`;
            return;
        }
        videoElement.style.position = "static";
        videoElement.style.top = `0px`;
        const width = videoContainerRef.current.offsetWidth;
        setFrameAspectRatio(htmlElement, width, AspectRatioAlg.W16H9);
    }

    const togglePlayVideo = () => {
        dispatch(setPlaying(!playing));
    }

    // Notify eventEmitter listeners for mouse move during full screen
    const fullscreenMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (fullScreen) {
            throttle(() => {
                if (mousePosition.current === null) {
                    mousePosition.current = { x: event.clientX, y: event.clientY }
                    return;
                }
                const distanceX = Math.max(mousePosition.current.x, event.clientX) - Math.min(mousePosition.current.x, event.clientX);
                const distanceY = Math.max(mousePosition.current.y, event.clientY) - Math.min(mousePosition.current.y, event.clientY);
                mousePosition.current = null;
                if (Math.max(distanceX, distanceY) > 70) {
                    eventEmitter.emit("mouseMoveFrame", distanceX);
                }
            }, 50)
        }
    }

    return (
        <>
            <div ref={playerContainerRef} style={{ position: "relative" }}>
                <Box sx={{ position: 'relative' }} component={"div"}>
                    <div style={{ backgroundColor: "#000000" }} ref={videoContainerRef}></div>
                    <div
                        onClick={() => togglePlayVideo()}
                        onMouseMove={fullscreenMouseMove}
                        style={{
                            position: fullScreen ? "fixed" : "absolute",
                            display: "flex",
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            zIndex: "9",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <VideoLoaderAnimation src={mpdSrc} videoElement={videoElement} />
                    </div>
                </Box>
                {children}
            </div>
        </>
    )
}

export default VideoPlayerFrame;