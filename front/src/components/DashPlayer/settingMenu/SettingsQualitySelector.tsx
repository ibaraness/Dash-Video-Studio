// MUI direct checked
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import {SelectChangeEvent} from "@mui/material/Select";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { selectSelectedTrack, selectAutoResolution, selectVariantTracks, setVariantTracks, setSelectedTrack, setShowQualityMenu } from "../../../features/videoPlayer/videoPlayerSlice";

export interface SettingsQualitySelectorProps {
    player: shaka.Player,
    src: string;
}

const SettingsQualitySelector = ({ player, src }: SettingsQualitySelectorProps) => {

    const selectedTrack = useAppSelector(selectSelectedTrack);
    const autoResolution = useAppSelector(selectAutoResolution);
    const variantTracks = useAppSelector(selectVariantTracks);

    const dispatch = useAppDispatch();

    const [age, setAge] = useState(selectedTrack.id + "");

    useEffect(() => {
        try {
            const variantTracks = player.getVariantTracks();
            dispatch(setVariantTracks(variantTracks.reverse()));
        } catch (e) {
            console.error(e);
        }
    }, [src, player, dispatch]);

    const handleChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setAge(value);
        if (value === "-1") {
            handlesSelectVariantTrack(null);
            return;
        }
        const track = variantTracks.find(track => +track.id === +value);
        handlesSelectVariantTrack(track || null);
    };

    const handlesSelectVariantTrack = (track: shaka.extern.Track | null) => {
        if (track === null) {
            dispatch(setSelectedTrack({ id: -1, title: "Auto" }));
            dispatch(setShowQualityMenu(false));
            return;
        }
        const { id, height, width } = track;
        const title = `${Math.min(width!, height!)}p`;
        dispatch(setSelectedTrack({ id, title }));
        dispatch(setShowQualityMenu(false));
    }

    // Menu items for quality
    const qualityMeniItems = variantTracks.filter(track => !!track.height && !!track.width).map(track => {
        const text = `${Math.min(track.width!, track.height!)}p`;
        return (
            <MenuItem key={track.id} value={track.id}>{text}</MenuItem>
        )
    });

    return (
        <FormControl fullWidth={true} variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="quality-select-standard-label">Quality</InputLabel>
            <Select
                fullWidth={true}
                labelId="quality-select-standard-label"
                id="quality-select-standard"
                value={age}
                onChange={handleChange}
                label="Quality"
            >
                {
                    qualityMeniItems
                }
                <MenuItem value={-1}>Auto({autoResolution})</MenuItem>
            </Select>
        </FormControl>
    )
}

export default SettingsQualitySelector;