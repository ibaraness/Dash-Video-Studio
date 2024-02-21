import 'vimond-replay/index.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectInitialized, selectIsSupported, setInitialized, setIsSupported } from '../../features/videoPlayer/videoPlayerSlice';
import shaka from 'shaka-player';
import ActualDashPlayer from './ActualDashPlayer';

const DashPlayer = () => {

    const isSupprted = useAppSelector(selectIsSupported);

    const initialized = useAppSelector(selectInitialized);

    const dispatch = useAppDispatch();

    if(!initialized){
        // Check to see if the browser supports the basic APIs Shaka needs.
        dispatch(setIsSupported(shaka.Player.isBrowserSupported()));
        dispatch(setInitialized(true));
    }

    return (
        <>
            {
                isSupprted
                    ? <ActualDashPlayer></ActualDashPlayer>
                    : <div>Not supported!</div>
            }
        </>
    )
}

export default DashPlayer;

