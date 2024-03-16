// Parse seconds number (int or float) to a formated time string
export const parseSecondsToTimeString = (duration: number) => {
    const secondsRest = duration % 60;
    let minutes = (duration - secondsRest) / 60;
    const seconds = Math.trunc(secondsRest);
    let hours = 0;
    if (minutes > 59) {
        const minutesRest = minutes % 60;
        hours = (minutes - minutesRest) / 60;
        minutes = minutesRest;
    }
    const time = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    return time;
}

export enum AspectRatioAlg {
    W16H9 = 9 / 16,
    W9H16 = 16 / 6,
    W1H1 = 1,
    W4H3 = 3 / 4
}

// Use the width of a block element to set the height to create a square in aspect ratio
export const setFrameAspectRatio = (
    htmlElement: HTMLElement,
    width: number,
    aspectRatio: AspectRatioAlg = AspectRatioAlg.W16H9
) => {
    htmlElement.style.width = `${width}px`;
    htmlElement.style.height = `${width * (aspectRatio)}px`;
}