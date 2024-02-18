import 'vimond-replay/index.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectDashURL } from '../../features/video/videoSlice';
import { useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import useShakaVideoPlayer from './hooks/useShakaVideoPlayer';
import { selectFallbackURL } from "../../features/video/videoSlice";
import MovieProgressbar from './MovieProgressbar';
import MoviePlayerBar from './MoviePlayerBar';
import { AspectRatioAlg, setFrameAspectRatio } from './utils/utils';
import { selectFullScreen, selectIsBuffering, selectLoaded, selectMute, selectPlaying, selectSelectedTrack, selectVolume, setAutoResolution, setFullScreen, setIsBuffering, setLoaded, setPlaying, setSelectedTrack, setShowQualityMenu, unloadAll } from '../../features/videoPlayer/videoPlayerSlice';

interface HTMLDivElementWebkitSupport extends HTMLDivElement {
    webkitRequestFullscreen: () => any;
    msRequestFullscreen: () => any;
}

const DashPlayer = () => {
    // Dash mpd src for streaming video (Later will come as a property - detach component from app state)
    const mpdSrc = useAppSelector(selectDashURL);

    const mp4Src = useAppSelector(selectFallbackURL);

    const loaded = useAppSelector(selectLoaded);

    const playing = useAppSelector(selectPlaying);

    const fullScreen = useAppSelector(selectFullScreen);

    const volume = useAppSelector(selectVolume);

    const mute = useAppSelector(selectMute);

    const selectedTrack = useAppSelector(selectSelectedTrack);

    const isBuffering = useAppSelector(selectIsBuffering);

    const dispatch = useAppDispatch();

    // Video container
    const videoContainerRef = useRef<HTMLDivElement>(null);

    const playerContainerRef = useRef<HTMLDivElementWebkitSupport>(null);

    const { player, videoElement, isSupportedBrowser } = useShakaVideoPlayer(videoContainerRef)

    useEffect(() => {
        updateFrameAspectRatio(videoElement);
        dispatch(unloadAll());
        dispatch(setSelectedTrack({ id: -1, title: "auto" }));
        dispatch(setShowQualityMenu(false));
        if (mpdSrc && player) {
            // videoElement.setAttribute("controls", "true");
            videoElement.setAttribute("autoplay", "true");
            loadVideo();
        }
    }, [mpdSrc]);

    useEffect(() => {
        //TODO: Implement ResizeObserver to listen better for changes on UI size
        function handleResize() {
            if (!videoElement) {
                return;
            }
            updateFrameAspectRatio(videoElement);
        }

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    });

    useEffect(() => {
        if (playing) {
            videoElement?.play();

        } else {
            videoElement?.pause();
        }
    }, [playing])

    const loadVideo = () => {
        if (!isSupportedBrowser) {
            //TODO: Later load a fallback version of the movie instead
            return;
        }
        loadDashVideo();
    }

    const loadDashVideo = async () => {
        try {
            // Load MPD stream manifest file of video
            await player.load(mpdSrc);
            dispatch(setLoaded(true));
            // If autoplay
            dispatch(setPlaying(true));
        } catch (err) {
            console.error("playDashVideo", err)
        }
    }

    useEffect(() => {

        function fullScreenChangeHandler() {
            dispatch(setFullScreen(!!document.fullscreenElement))
        }

        /* View in fullscreen */
        function openFullscreen() {
            if (!playerContainerRef.current) {
                return;
            }
            const elem = playerContainerRef.current;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
                elem.addEventListener("fullscreenchange", fullScreenChangeHandler);
            }

            // else if (elem.webkitRequestFullscreen) { /* Safari */
            //     elem.webkitRequestFullscreen();
            // } else if (elem.msRequestFullscreen) { /* IE11 */
            //     elem.msRequestFullscreen();
            // }
        }

        /* Close fullscreen */
        function closeFullscreen() {
            try {
                if (document.exitFullscreen && document.fullscreenElement !== null) {
                    document.exitFullscreen();
                }

                // else if (document.webkitExitFullscreen) { /* Safari */
                //     document.webkitExitFullscreen();
                // } else if (document.msExitFullscreen) { /* IE11 */
                //     document.msExitFullscreen();
                // }
            } catch (e) {

            }

        }
        if (fullScreen) {
            openFullscreen();
            videoElement.style.width = "100vw";
            videoElement.style.height = "100vh";
        } else {
            closeFullscreen();
            updateFrameAspectRatio(videoElement);
        }
        return () => {
            if (playerContainerRef.current) {
                playerContainerRef.current.removeEventListener("fullscreenchange", fullScreenChangeHandler)
            }
        }
    }, [fullScreen]);

    useEffect(() => {
        videoElement.muted = mute;
    }, [mute]);

    useEffect(() => {
        videoElement.volume = volume / 100;
    }, [volume]);

    useEffect(() => {
        // Toggle auto adaptive bitrate streaming
        const toggleAutoABR = (enabled = true) => {
            try {
                // const player = ShakaPlayerRef.current;
                player.configure({
                    abr: { enabled }
                });
            } catch (err) {
                console.error(err)
            }
        }
        try {
            const isAuto = selectedTrack.id === -1;
            toggleAutoABR(isAuto);
            if (isAuto) {
                return;
            }
            const track = player.getVariantTracks().find(track => +track.id === selectedTrack.id);
            if (track) {
                player.selectVariantTrack(track, true);
            }
        } catch (err) {
            console.error(err)
        }
    }, [selectedTrack]);

    useEffect(() => {
        function progressHandler() {
            if (videoElement.readyState === 4) {
                dispatch(setIsBuffering(false));

                if (selectedTrack.id === -1) {
                    const active = player.getVariantTracks().find(track => track.active);
                    const resolution = Math.min(active?.width || 0, active?.height || 0);
                    dispatch(setAutoResolution(resolution > 0 ?`${resolution}p`:""))
                    console.log("q", `Auto(${resolution}p)`);
                }


            }
        }
        function loadeddataHandler() {
            dispatch(setIsBuffering(true));
        }
        videoElement.addEventListener("waiting", loadeddataHandler);
        videoElement.addEventListener("progress", progressHandler);
        return () => {
            videoElement.removeEventListener("progress", progressHandler);
            videoElement.removeEventListener("waiting", loadeddataHandler);
        }
    }, [mpdSrc])

    const updateFrameAspectRatio = (htmlElement: HTMLElement) => {
        if (!videoContainerRef.current || fullScreen) {
            return;
        }
        const width = videoContainerRef.current.offsetWidth;
        setFrameAspectRatio(htmlElement, width, AspectRatioAlg.W16H9);
    }

    const togglePlayVideo = () => {
        dispatch(setPlaying(!playing));
    }

    return (
        <div ref={playerContainerRef} style={{ position: "relative" }}>
            <Box sx={{ position: 'relative' }} component={"div"}>
                <div style={{ backgroundColor: "#000000" }} ref={videoContainerRef}></div>
                <div
                    onClick={() => togglePlayVideo()}
                    style={{
                        position: "absolute",
                        display: "flex",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    {
                        isBuffering && <CircularProgress />
                    }

                </div>
            </Box>


            {/* Resolution menu */}
            {
                loaded &&
                <Box sx={{
                    width: "100%",
                    height: "auto",
                    position: "absolute",
                    left: "0px",
                    bottom: "0px",
                    pb: "10px",
                    background: "linear-gradient(rgba(0,0,0,0), #000000)"
                    // backgroundColor: "rgba(0,0,0,.5)" 
                }}>
                    <Box sx={{ px: 0 }}>
                        <MovieProgressbar src={mpdSrc} player={player} videoElement={videoElement}></MovieProgressbar>
                    </Box>
                    <MoviePlayerBar player={player} videoElement={videoElement} src={mpdSrc}></MoviePlayerBar>
                </Box>
            }
        </div>
    )
}

export default DashPlayer;

