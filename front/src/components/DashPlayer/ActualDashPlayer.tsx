// MUI direct checked
// @ts-nocheck
import 'vimond-replay/index.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectDashURL } from '../../features/video/videoSlice';
import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import useShakaVideoPlayer from './hooks/useShakaVideoPlayer';
import MovieProgressbar from './MovieProgressbar';
import MoviePlayerBar from './MoviePlayerBar';
import { selectFullScreen, selectLoaded, selectMute, selectPlaying, selectSelectedTrack, selectVolume, setAutoResolution, setLoaded, setPlaying, setSelectedTrack, setShowQualityMenu, unloadAll } from '../../features/videoPlayer/videoPlayerSlice';
import useShakaABR from './hooks/useShakaABR';
import eventEmitter from './utils/eventEmitter';
import useVideoEventEmitter, { VideoEvent } from './hooks/useVideoEventEmitter';
import VideoPlayerFrame from './VideoPlayerFrame';
import SettingMenu from './settingMenu/SettingMenu';

const ActualDashPlayer = () => {
    // Dash mpd src for streaming video (Later will come as a property - detach component from app state)
    const mpdSrc = useAppSelector(selectDashURL);

    const loaded = useAppSelector(selectLoaded);

    const playing = useAppSelector(selectPlaying);

    const volume = useAppSelector(selectVolume);

    const mute = useAppSelector(selectMute);

    const selectedTrack = useAppSelector(selectSelectedTrack);

    const dispatch = useAppDispatch();

    const runOnce = useRef<number>(12345678);

    const fullScreen = useAppSelector(selectFullScreen);

    const { player, videoElement } = useShakaVideoPlayer(runOnce.current);

    // TODO: Move to redux player slice
    const [isHidePlayerMenu, setIsHidePlayerMenu] = useState(false);

    // Get or set fullscreen state before re-render
    const localFullScreenState = useRef(false);

    // A flag to set the hideMenuDelay function as active to avoid calling it more than once when active
    const isMenuHideDelayActive = useRef(false);

    // Start listening for video events
    useVideoEventEmitter(videoElement);

    // Load dash mpd file to shaka-player and set video to autoplay
    useEffect(() => {
        const loadDashVideo = async () => {
            try {
                if(!player.getMediaElement()){
                    await player.attach(videoElement);
                }
                // Load MPD stream manifest file of video
                await player.load(mpdSrc);
                dispatch(setLoaded(true));
                // If autoplay
                dispatch(setPlaying(true));
            } catch (err) {
                console.error("playDashVideo", err)
            }
        }

        const unloadVideo = async () => {
            await player.unload();
            await player.attach(videoElement);
        }

        // updateFrameAspectRatio(videoElement);
        dispatch(unloadAll());
        dispatch(setSelectedTrack({ id: -1, title: "auto" }));
        dispatch(setShowQualityMenu(false));
        if (mpdSrc && player) {
            // videoElement.setAttribute("controls", "true");
            videoElement.setAttribute("autoplay", "true");
            loadDashVideo();
        } 
        else if(!mpdSrc && player) {
            unloadVideo();
        }
    }, [mpdSrc, player, videoElement, dispatch]);

    // Toggle auto ABR and set auto bitrate or user select 
    useShakaABR(selectedTrack, player);  

    useEffect(() => {
        function updateAutoABR() {
            if (videoElement.readyState === 4 && mpdSrc) {
                if (selectedTrack.id === -1) {
                    const active = player.getVariantTracks().find((track) => track.active);
                    const resolution = Math.min(active?.width || 0, active?.height || 0);
                    dispatch(setAutoResolution(resolution > 0 ? `${resolution}p` : ""));
                }
            }
        }
        const listener = eventEmitter.addListener(VideoEvent.Progress, updateAutoABR);
        return () => {
            listener.remove();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mpdSrc, player, selectedTrack]);

    // Toggle video player play by state
    useEffect(() => {
        if (playing && mpdSrc) {
            videoElement?.play();
        } else {
            videoElement?.pause();
        }
    }, [playing, videoElement, mpdSrc]);

    useEffect(() => {
        videoElement.muted = mute;
    }, [mute, videoElement]);

    useEffect(() => {
        videoElement.volume = volume / 100;
    }, [volume, videoElement]);

    

    const hideMenuDelay = useCallback((delay = 1000) => {
        setTimeout(() => {
            isMenuHideDelayActive.current = false;
            if (localFullScreenState.current) {
                setIsHidePlayerMenu(true);
                document.body.style.cursor = 'none';
            }
        }, delay)
    }, []);

    useEffect(() => {
        function fullScreenHandler(isFullscreen: boolean) {
            localFullScreenState.current = isFullscreen;
            if (isFullscreen) {
                hideMenuDelay();
                return;
            }
            setIsHidePlayerMenu(isFullscreen);
            document.body.style.cursor = 'default';
        }

        function showMenuAgain() {
            if (fullScreen && !isMenuHideDelayActive.current) {
                setIsHidePlayerMenu(false);
                isMenuHideDelayActive.current = true;
                document.body.style.cursor = 'default';
                hideMenuDelay(5000);
            }
        }

        const fullScreenListener = eventEmitter.addListener('fullscreenchange', fullScreenHandler);
        const mouseListener = eventEmitter.addListener('mouseMoveFrame', showMenuAgain);
        return () => {
            fullScreenListener.remove();
            mouseListener.remove();
        }
    }, [fullScreen, hideMenuDelay]);

    useEffect(() => {
        setIsHidePlayerMenu(fullScreen);
    }, [fullScreen])

    return (
        <VideoPlayerFrame mpdSrc={mpdSrc} videoElement={videoElement}>
            {
                loaded &&
                <Box sx={{
                    width: "100%",
                    height: "auto",
                    position: "absolute",
                    zIndex: "99",
                    left: "0px",
                    bottom: "0px",
                    pb: { sm: "10px", xs: "0" },
                    background: "linear-gradient(rgba(0,0,0,0), #000000)"
                }}>
                    <div style={{ opacity: isHidePlayerMenu ? 0 : 1, transition: "opacity .5s" }}>
                        <>
                            <Box sx={{ px: 0 }}>
                                <MovieProgressbar src={mpdSrc} player={player} videoElement={videoElement}></MovieProgressbar>
                            </Box>
                            <MoviePlayerBar player={player} videoElement={videoElement} src={mpdSrc}></MoviePlayerBar>
                        </>
                    </div>

                </Box>
            }
            <SettingMenu player={player} src={mpdSrc} />
        </VideoPlayerFrame>
    )
}

export default ActualDashPlayer;