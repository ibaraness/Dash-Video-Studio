import { useEffect } from "react";
import eventEmitter from "../utils/eventEmitter";

export default function useVideoEventEmitter(videoElement: HTMLVideoElement) {

    useEffect(() => {
        function progressHandler() { eventEmitter.emit(VideoEvent.Progress) }
        function waitingHandler() { eventEmitter.emit(VideoEvent.Waiting) }
        function endedHandler() { eventEmitter.emit('ended') }
        function errorHandler() { eventEmitter.emit('error') }
        function pauseHandler() { eventEmitter.emit('pause') }
        function playHandler() { eventEmitter.emit('play') }
        function timeUpdateHandler() { eventEmitter.emit(VideoEvent.TimeUpdate) }
        function loadedDataHandler() { eventEmitter.emit(VideoEvent.LoadedData) }

        videoElement.addEventListener(VideoEvent.Progress, progressHandler);
        videoElement.addEventListener(VideoEvent.Waiting, waitingHandler);
        videoElement.addEventListener("ended", endedHandler);
        videoElement.addEventListener("error", errorHandler);
        videoElement.addEventListener("pause", pauseHandler);
        videoElement.addEventListener("play", playHandler);
        videoElement.addEventListener(VideoEvent.TimeUpdate, timeUpdateHandler);
        videoElement.addEventListener(VideoEvent.LoadedData, loadedDataHandler);
        return () => {
            videoElement.removeEventListener(VideoEvent.Progress, progressHandler);
            videoElement.removeEventListener(VideoEvent.Waiting, waitingHandler);
            videoElement.removeEventListener("ended", endedHandler);
            videoElement.removeEventListener("error", errorHandler);
            videoElement.removeEventListener("pause", pauseHandler);
            videoElement.removeEventListener("play", playHandler);
            videoElement.removeEventListener(VideoEvent.TimeUpdate, timeUpdateHandler);
            videoElement.removeEventListener(VideoEvent.LoadedData, loadedDataHandler);
        }

    }, [videoElement])
}

export enum VideoEvent {
    Progress = "progress",
    Waiting = "waiting",
    Ended = "ended",
    Error = "error",
    Pause = "pause",
    Play = "play",
    TimeUpdate = "timeupdate",
    LoadedData = "loadeddata"
}