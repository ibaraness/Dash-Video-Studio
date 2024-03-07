import { Box, Button, Grid, IconButton, Slider } from "@mui/material";
import VideoTimer from "./VideoTimer";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SettingsIcon from '@mui/icons-material/Settings';
import QualitySwitcher from "./QualitySwitcher";
import "shaka-player";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { selectAutoResolution, selectFullScreen, selectMute, selectPlaying, selectSelectedTrack, selectSettingIsOpen, selectShowQualityMenu, selectVolume, setFullScreen, setMute, setPlaying, setSettingIsOpen, setShowQualityMenu, setVolume } from "../../features/videoPlayer/videoPlayerSlice";
import { useEffect } from "react";
import eventEmitter from "./utils/eventEmitter";
import { VideoEvent } from "./hooks/useVideoEventEmitter";

export interface MoviePlayerBarProps {
    videoElement: HTMLVideoElement,
    player: shaka.Player,
    src: string
}

const MoviePlayerBar = ({ videoElement, src, player }: MoviePlayerBarProps) => {

    // const [playing, setPlaying] = useState<boolean>(false);
    const playing = useAppSelector(selectPlaying);
    const fullScreen = useAppSelector(selectFullScreen);
    const volume = useAppSelector(selectVolume);
    const mute = useAppSelector(selectMute);
    const selectedTrack = useAppSelector(selectSelectedTrack);
    const showQualityMenu = useAppSelector(selectShowQualityMenu);
    const autoResolution = useAppSelector(selectAutoResolution);
    const settingIsOpen = useAppSelector(selectSettingIsOpen);

    useEffect(() => {
        function setPlayingState(){
            dispatch(setPlaying(false));
        }
        const listener = eventEmitter.addListener(VideoEvent.Ended, setPlayingState);
        return () => {
            listener.remove();
        }
    })

    const dispatch = useAppDispatch();

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

    const toggleSettings = () => {
        //different behaviour for mobile and destop
        dispatch(setSettingIsOpen(!settingIsOpen));
    }

    return (
        <Grid container alignContent={"center"} paddingLeft={1} paddingRight={1} justifyContent={"center"} height={"100%"}>
            <Grid display={"flex"} alignItems={"center"} flexDirection={"row"} item xs={8}>
                <IconButton sx={{display:{xs:"flex", sm:"flex"}}}  onClick={() => togglePlayVideo()} aria-label="play">
                    {!playing
                        ? <PlayArrowIcon sx={{ color: "white" }} />
                        : <PauseIcon sx={{ color: "white" }} />
                    }

                </IconButton>
                <IconButton sx={{display:{xs:"none", sm:"flex"}}} onClick={() => toggleMute()} aria-label="volume">
                    {
                        mute
                            ? <VolumeOffIcon sx={{ color: "white" }} />
                            : <VolumeUpIcon sx={{ color: "white" }} />
                    }

                </IconButton>{
                    !mute &&
                    <Slider sx={{display:{xs:"none", md:"block"}, marginLeft: 0, width: "100px", color: "white" }} aria-label="Volume" value={volume} onChange={handleVolumeChange} />
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
                <IconButton onClick={() =>  toggleSettings()} sx={{ position: "relative" }} aria-label="settings">
                    <SettingsIcon sx={{ color: "white" }} />
                </IconButton>
                <Box sx={{ position: "relative" }}>
                    <Button sx={{display:{xs:"none", md:"inline-block"}, color:"white"}} onClick={() => toggleQualityMenu()} >
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