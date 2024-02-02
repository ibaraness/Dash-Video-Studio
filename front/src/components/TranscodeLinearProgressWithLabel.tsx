import { useAppSelector } from "../app/hooks";
import { selectTranscodeSize } from "../features/transcode/transcodeSlice";
import { RootState } from "../store/store";
import LinearProgressWithLabel from "./LinearProgressWithLabel";

export const TranscodeLinearProgressWithLabel = ({ size }: { size: string }) => {
    const transcodeData = useAppSelector((state: RootState) => selectTranscodeSize(state, size));
  
    return (
      <LinearProgressWithLabel value={transcodeData?.percent ?? 0} />
    )
  }
  