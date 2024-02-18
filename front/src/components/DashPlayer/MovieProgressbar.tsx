import { LinearProgress, Slider } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import shaka from "shaka-player";
import { selectBuffer, selectPlaying, selectProgressValue, setBuffer, setPlaying, setProgressValue } from "../../features/videoPlayer/videoPlayerSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

export interface MovieProgressbarProps {
    player: shaka.Player;
    videoElement: HTMLVideoElement;
    src: string;
}
const MovieProgressbar = ({ player, videoElement, src }: MovieProgressbarProps) => {

    const progressValue = useAppSelector(selectProgressValue);

    const buffer = useAppSelector(selectBuffer);
    const playing = useAppSelector(selectPlaying);
    const dispatch = useAppDispatch();

    const interval = useRef<any>(null)

    const duration = useRef<number>(0);

    useEffect(() => {
        function playHandler() {
            interval.current = setInterval(setTimer, 1000);
            updateProgress();
            // dispatch(setPlaying(true));
        }

        function pauseHandler() {
            updateProgress();
            if (interval.current) {
                clearInterval(interval.current);
            }
            // dispatch(setPlaying(false));
        }

        function progressHandler() {
            try {
                const bufferRange = player.getBufferedInfo().total[0];
                const percentSlice = 100 / duration.current;
                dispatch(setBuffer(Math.round(bufferRange.end * percentSlice)))
            } catch (e) {

            }
        }

        function updateProgress() {
            const percentSlice = 100 / duration.current;
            const percentOfTime = Math.round(videoElement.currentTime * percentSlice);
            dispatch(setProgressValue(percentOfTime));
        }

        function videoEnd() {
            pauseHandler();
            // dispatch(setPlaying(false));
        }

        function setTimer() {
            updateProgress();
        }
        try {
            // Get the video element from the player
            const totalDuration = videoElement.duration;
            if (!isNaN(totalDuration)) {
                duration.current = totalDuration
            }

            if (playing) {
                if (progressValue === 100) {
                    dispatch(setProgressValue(0));
                }
                playHandler();
            } else {
                pauseHandler();
            }
            videoElement.addEventListener("progress", progressHandler);
            videoElement.addEventListener("ended", videoEnd);

        } catch (e) {
            console.error('Video element:', e);
        }
        return () => {
            pauseHandler();
            videoElement.removeEventListener("progress", progressHandler);
            videoElement.removeEventListener("ended", videoEnd);
        }
    }, [playing])

    const setPosition = (value: number) => {
        dispatch(setProgressValue(value));
        const duration = videoElement.duration || 0;
        const position = (duration / 100) * value;
        videoElement.currentTime = position;
    }

    return (
        // <LinearProgress variant="buffer" value={progressValue} valueBuffer={buffer} />
        <div style={{position:"relative", height:"50px", padding:"20px"}}>
            <div style={{
                height:"4px",
                backgroundColor:"turquoise",
                width: buffer + "%",
                position:"relative",
                top:"17px"
            }}></div>
            <Slider
                aria-label="time-indicator"
                size="small"
                value={progressValue}
                min={0}
                step={1}
                max={100}
                  onChange={(_, value) => setPosition(value as number)}
                sx={{
                    // position:"absolute",
                    color: true ? '#fff' : 'rgba(0,0,0,0.87)',
                    height: 4,
                    '& .MuiSlider-thumb': {
                        width: 8,
                        height: 8,
                        transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                        '&:hover, &.Mui-focusVisible': {
                            boxShadow: `0px 0px 0px 8px ${true
                                    ? 'rgb(255 255 255 / 16%)'
                                    : 'rgb(0 0 0 / 16%)'
                                }`,
                        },
                        '&.Mui-active': {
                            width: 20,
                            height: 20,
                        },
                    },
                    '& .MuiSlider-rail': {
                        opacity: 0.28,
                    },
                }}
            />
        </div>

    )
}

export default MovieProgressbar;