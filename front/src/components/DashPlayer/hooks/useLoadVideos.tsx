import { useEffect, useRef } from "react";
import { VideoResponse, getAllVideos } from "../../../services/restAPI";

export default function useVideoList(isInitialized:boolean = false) {
    const initialized = useRef(isInitialized);
    const videos = useRef<VideoResponse[]>([]);
    
    useEffect(() => {
        async function loadVideos() {
            const res = await getAllVideos();
            if (res.isError) {
                console.error(res.errorMessage);
                return;
            }
            videos.current = res.data;
        }
        if (!initialized.current) {
            initialized.current = true;
            console.log("asdasdas")
            loadVideos();
        }
        // State to trigger change in initialized
    })

    return {
        videoList: videos.current,
        refetch: () => {initialized.current = false}
    }
}