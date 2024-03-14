// @ts-nocheck
import { SelectedTrackInfo } from "../../../features/videoPlayer/videoPlayerSlice";
import { useEffect } from "react";

export default function useShakaABR(selectedTrack: SelectedTrackInfo, player: shaka.Player){
    
    // Toggle auto ABR and set auto bitrate or user select 
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
    }, [selectedTrack, player]);

}