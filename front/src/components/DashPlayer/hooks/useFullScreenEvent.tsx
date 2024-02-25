import { useEffect, useRef } from "react";
import eventEmitter from "../utils/eventEmitter";

export default function useFullScreenEvent(elem: HTMLElement, fullScreen:boolean) {
    const isFullScreen = useRef<boolean>(false);

    useEffect(() => {
        function fullScreenChangeHandler() {
            isFullScreen.current = !!document.fullscreenElement;
            eventEmitter.emit('fullscreenchange', !!document.fullscreenElement);
            // callback && callback(isFullScreen.current);
        }

        /* View in fullscreen */
        function openFullscreen() {
            if (!elem) {
                return;
            }

            if (elem.requestFullscreen) {
                elem.requestFullscreen();
                elem.addEventListener("fullscreenchange", fullScreenChangeHandler);
            }
        }

        /* Close fullscreen */
        function closeFullscreen() {
            try {
                if (document.exitFullscreen && document.fullscreenElement !== null) {
                    elem.addEventListener("fullscreenchange", fullScreenChangeHandler);
                    document.exitFullscreen();
                }
            } catch (e) {
                console.error(e);
            }
        }
        if (fullScreen) {
            openFullscreen();
        } else {
            closeFullscreen();
        }
        return () => {
            if (elem) {
                elem.removeEventListener("fullscreenchange", fullScreenChangeHandler)
            }
        }
    }, [elem, fullScreen]);
}