import { useEffect } from "react";
import eventEmitter from "../utils/eventEmitter";

export default function useVideoEventEmitter(videoElement: HTMLVideoElement) {

    useEffect(() => {
        function progressHandler() { eventEmitter.emit(VideoEvent.Progress) }
        function waitingHandler() { eventEmitter.emit(VideoEvent.Waiting) }
        function endedHandler() { eventEmitter.emit(VideoEvent.Ended) }
        function errorHandler() { eventEmitter.emit(VideoEvent.Error) }
        function pauseHandler() { eventEmitter.emit(VideoEvent.Pause) }
        function playHandler() { eventEmitter.emit(VideoEvent.Play) }
        function timeUpdateHandler() { eventEmitter.emit(VideoEvent.TimeUpdate) }
        function loadedDataHandler() { eventEmitter.emit(VideoEvent.LoadedData) }
        function playThroughDataHandler() { eventEmitter.emit(VideoEvent.CanPlayThrough) }

        videoElement.addEventListener(VideoEvent.Progress, progressHandler);
        videoElement.addEventListener(VideoEvent.Waiting, waitingHandler);
        videoElement.addEventListener(VideoEvent.Ended, endedHandler);
        videoElement.addEventListener(VideoEvent.Error, errorHandler);
        videoElement.addEventListener(VideoEvent.Pause, pauseHandler);
        videoElement.addEventListener(VideoEvent.Play, playHandler);
        videoElement.addEventListener(VideoEvent.TimeUpdate, timeUpdateHandler);
        videoElement.addEventListener(VideoEvent.LoadedData, loadedDataHandler);
        videoElement.addEventListener(VideoEvent.CanPlayThrough, playThroughDataHandler);
        return () => {
            videoElement.removeEventListener(VideoEvent.Progress, progressHandler);
            videoElement.removeEventListener(VideoEvent.Waiting, waitingHandler);
            videoElement.removeEventListener(VideoEvent.Ended, endedHandler);
            videoElement.removeEventListener(VideoEvent.Error, errorHandler);
            videoElement.removeEventListener(VideoEvent.Pause, pauseHandler);
            videoElement.removeEventListener(VideoEvent.Play, playHandler);
            videoElement.removeEventListener(VideoEvent.TimeUpdate, timeUpdateHandler);
            videoElement.removeEventListener(VideoEvent.LoadedData, loadedDataHandler);
            videoElement.removeEventListener(VideoEvent.CanPlayThrough, playThroughDataHandler);
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
    LoadedData = "loadeddata",
    CanPlayThrough = "canplaythrough"
}