import { IconButton } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { selectActiveBreakpoint } from "../../features/ui/uiSlice";
import { selectMute, setMute } from "../../features/videoPlayer/videoPlayerSlice";
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const MobileMuteButton = () => {
    const mute = useAppSelector(selectMute);
    const activeBreakingPoint = useAppSelector(selectActiveBreakpoint);
    // get is mobile

    const dispatch = useAppDispatch();

    const toggleMute = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        dispatch(setMute(!mute));
    }
    return (
        <>
            {
                activeBreakingPoint === "xs" && <IconButton onClick={(event) => toggleMute(event)}>
                    <VolumeOffIcon sx={{ color: "white", opacity: mute ? 1 : 0 }} />
                </IconButton>
            }
        </>

    )
}

export default MobileMuteButton;