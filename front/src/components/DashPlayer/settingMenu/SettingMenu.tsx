import { Dialog, DialogTitle, DialogContent, Box } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectSettingIsOpen, setSettingIsOpen } from "../../../features/videoPlayer/videoPlayerSlice";
import SettingsQualitySelector from "./SettingsQualitySelector";

export interface SettingMenuProps {
    player: shaka.Player,
    src: string;
}

const SettingMenu = ({ player, src }: SettingMenuProps) => {
    const settingIsOpen = useAppSelector(selectSettingIsOpen);
    
    const dispatch = useAppDispatch();

    const handleClose = (approved: boolean) => {
        dispatch(setSettingIsOpen(approved));
    }

    return (
        <Dialog
            fullWidth={true}
            maxWidth={"xs"}
            style={{height:"100%"}}
            open={settingIsOpen}
            onClose={() => { handleClose(false) }}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">
                {"Settings"}
            </DialogTitle>
            <DialogContent style={{height:"100%"}}>
                <Box sx={{ position: "relative" }}>
                    <SettingsQualitySelector player={player} src={src} />
                </Box>
            </DialogContent>
        </Dialog>
    )
}
export default SettingMenu;