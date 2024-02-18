import { useRef, useEffect } from "react";
import shaka from 'shaka-player';

export default function useShakaVideoPlayer(videoContainerRef: React.RefObject<HTMLDivElement>){
    const isSupportedBrowser = useRef<boolean>(true);

    // Shaka player reference - to be used between renders
    const shakaPlayerRef = useRef<shaka.Player>(new shaka.Player());

    // Video element ref
    const videoElementRef = useRef<HTMLVideoElement>(document.createElement('video'));

    useEffect(() => {

        // Reference the video HTML element
        const videoElement: HTMLVideoElement = videoElementRef.current as HTMLVideoElement;

        // Install built-in polyfills to patch browser incompatibilities.
        shaka.polyfill.installAll();

        // Check to see if the browser supports the basic APIs Shaka needs.
        if (shaka.Player.isBrowserSupported()) {
            // Everything looks good!
            // Create Dash player using video element
            shakaPlayerRef.current.attach(videoElementRef.current);
        } else {
            // This browser does not have the minimum set of APIs we need.
            console.error('Browser not supported!');
            // Set supported flag to false so fallback player can be activated (regular streaming);
            isSupportedBrowser.current = false;
        }

        // Append video element to div container
        if (videoContainerRef.current && videoContainerRef.current.firstChild !== videoElement) {
            videoContainerRef.current.appendChild(videoElement);
        } 

    }, [videoContainerRef]);

    return {
        player: shakaPlayerRef.current,
        videoElement: videoElementRef.current,
        isSupportedBrowser: isSupportedBrowser.current
    }
}