import { Box, Button, Grid, IconButton, Slider, Stack } from "@mui/material";
import { useState, useEffect } from "react";
import VideoTimer from "./VideoTimer";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SettingsIcon from '@mui/icons-material/Settings';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import QualitySwitcher from "./QualitySwitcher";
import shaka from "shaka-player";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { selectAutoResolution, selectFullScreen, selectLoaded, selectMute, selectPlaying, selectSelectedTrack, selectShowQualityMenu, selectVolume, setFullScreen, setMute, setPlaying, setShowQualityMenu, setVolume } from "../../features/videoPlayer/videoPlayerSlice";

export interface MoviePlayerBarProps {
    videoElement: HTMLVideoElement,
    player: shaka.Player,
    src: string
}

const MoviePlayerBar = ({ videoElement, src, player }: MoviePlayerBarProps) => {

    // const [playing, setPlaying] = useState<boolean>(false);
    const playing = useAppSelector(selectPlaying);
    const loaded = useAppSelector(selectLoaded);
    const fullScreen = useAppSelector(selectFullScreen);
    const volume = useAppSelector(selectVolume);
    const mute = useAppSelector(selectMute);
    const selectedTrack = useAppSelector(selectSelectedTrack);
    const showQualityMenu = useAppSelector(selectShowQualityMenu);
    const autoResolution = useAppSelector(selectAutoResolution);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!loaded) {
            // Do something
        }
    }, [loaded])

    const togglePlayVideo = () => {
        dispatch(setPlaying(!playing));
    }

    const toggleFullScreen = () => {
        dispatch(setFullScreen(!fullScreen));
    }

    const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
        if (typeof newValue === "number") {
            dispatch(setVolume(newValue));
        }
    }

    const toggleMute = () => {
        dispatch(setMute(!mute));
    }

    const toggleQualityMenu = () => {
        dispatch(setShowQualityMenu(!showQualityMenu));
    }

    return (
        <Grid container alignContent={"center"} paddingLeft={1} paddingRight={1} justifyContent={"center"} height={"100%"}>
            <Grid display={"flex"} alignItems={"center"} flexDirection={"row"} item xs={8}>
                <IconButton onClick={() => togglePlayVideo()} aria-label="play">
                    {!playing
                        ? <PlayArrowIcon sx={{ color: "white" }} />
                        : <PauseIcon sx={{ color: "white" }} />
                    }

                </IconButton>
                <IconButton onClick={() => toggleMute()} aria-label="volume">
                    {
                        mute
                            ? <VolumeOffIcon sx={{ color: "white" }} />
                            : <VolumeUpIcon sx={{ color: "white" }} />
                    }

                </IconButton>{
                    !mute &&
                    <Slider sx={{ marginLeft: 0, width: "100px", color: "white" }} aria-label="Volume" value={volume} onChange={handleVolumeChange} />
                }
                <VideoTimer video={videoElement} src={src}></VideoTimer>
            </Grid>
            <Grid display={"flex"} alignItems={"center"} flexDirection={"row-reverse"} item xs={4}>
                <IconButton onClick={() => toggleFullScreen()} aria-label="fullscreen">
                    {
                        !fullScreen
                            ? <FullscreenIcon sx={{ color: "white" }} />
                            : <FullscreenExitIcon sx={{ color: "white" }} />
                    }


                </IconButton>
                <IconButton sx={{ position: "relative" }} aria-label="settings">
                    <SettingsIcon sx={{ color: "white" }} />
                </IconButton>
                <Box sx={{ position: "relative" }}>
                    <Button sx={{color:"white"}} onClick={() => toggleQualityMenu()} >
                        {selectedTrack.title}
                        {
                            selectedTrack.id === -1 && `(${autoResolution})`
                        }
                    </Button>
                    {
                        showQualityMenu && <QualitySwitcher player={player} src={src}></QualitySwitcher>
                    }
                </Box>
            </Grid>
        </Grid>
    )
}

export default MoviePlayerBar;