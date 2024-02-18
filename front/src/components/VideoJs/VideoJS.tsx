import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

export interface VideoJSProps {
    options: any;
    onReady?: (e: any) => void;
}

export const VideoJS = ({ options, onReady }: VideoJSProps) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Player | null>(null);

    useEffect(() => {

        // Make sure Video.js player is only initialized once
        if (!playerRef.current && videoRef.current) {
            // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
            const videoElement = document.createElement("video-js");

            videoElement.classList.add('vjs-big-play-centered');
            videoRef.current.appendChild(videoElement);

            const player = playerRef.current = videojs(videoElement, options, () => {
                videojs.log('player is ready');
                onReady && onReady(player);
            });

            // You could update an existing player in the `else` block here
            // on prop change, for example:
        } else {
            const player = playerRef.current;
            if (!player) {
                return;
            }

            player.autoplay(options.autoplay);
            player.src(options.sources);
        }
    }, [options, videoRef]);

    // Dispose the Video.js player when the functional component unmounts
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    return (
        <div data-vjs-player>
            <div ref={videoRef} />
        </div>
    );
}

export default VideoJS;

interface VideoJSContainerProps {
    mp4Src: string;
}

export const VideoJSContainer = ({mp4Src: src}:VideoJSContainerProps) => {

    const playerRef = useRef<Player | null>(null);

    const videoJsOptions = {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src,
            type: 'video/mp4'
        }]
    };

    console.log("test")
    const handlePlayerReady = (player: Player) => {
        playerRef.current = player;

        // You can handle player events here, for example:
        player.on('waiting', () => {
            videojs.log('player is waiting');
        });

        player.on('dispose', () => {
            videojs.log('player will dispose');
        });
    };

    return (
        <>
            <div>Rest of app here</div>
            {
                src && <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
            }
            <div>Rest of app here</div>
        </>
    );
}