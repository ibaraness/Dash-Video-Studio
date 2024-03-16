import { DashPlayer } from 'dash-studio-player'
export interface LazyVideoPlayerProps {
    mpdUrl: string;
}
const LazyVideoPlayer = ({mpdUrl}: LazyVideoPlayerProps) => {
    return (
        <DashPlayer mpdUrl={mpdUrl} />
    )
}

export default LazyVideoPlayer;