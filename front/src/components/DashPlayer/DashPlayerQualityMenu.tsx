// MUI direct checked
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";

import CheckIcon from '@mui/icons-material/Check';
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { selectSelectedTrack, setSelectedTrack, setShowQualityMenu } from "../../features/videoPlayer/videoPlayerSlice";

export interface DashPlayerQualityMenuProps {
    variantTracks: shaka.extern.TrackList;
}

const DashPlayerQualityMenu = ({ variantTracks }: DashPlayerQualityMenuProps) => {

    const selectedTrack = useAppSelector(selectSelectedTrack);
    const dispatch = useAppDispatch();

    const handlesSelectVariantTrack = (track: shaka.extern.Track | null) => {
        if(track === null){
            dispatch(setSelectedTrack({id:-1, title:"Auto"}));
            dispatch(setShowQualityMenu(false));
            return;
        } 
        const {id, height, width} = track;
        const title = `${Math.min(width!, height!)}p`;
        dispatch(setSelectedTrack({id, title}));
        dispatch(setShowQualityMenu(false));
    }

    const qualitiesList = variantTracks.filter(track => !!track.height && !!track.width).map(track => {
        const text = `${Math.min(track.width!, track.height!)}p`;
        return (
            <ListItem key={track.id} disablePadding={true}>
                <ListItemButton sx={{ py: 0 }} onClick={() => handlesSelectVariantTrack(track)} >
                    <ListItemIcon>
                        {
                            selectedTrack.id === +track.id && <CheckIcon />
                        }
                    </ListItemIcon>
                    <ListItemText primary={text} />
                </ListItemButton>
            </ListItem>
        )
    })

    return (
        <Paper>
            <List>
                {
                    qualitiesList
                }
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handlesSelectVariantTrack(null)} sx={{ py: 0 }}>
                        <ListItemIcon>
                            {
                                selectedTrack.id === -1 && <CheckIcon />
                            }
                        </ListItemIcon>
                        <ListItemText primary="Auto" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Paper>
    )
}

export default DashPlayerQualityMenu;