import { Box, Button, Paper, Stack } from "@mui/material";
import { useAppSelector } from "../app/hooks";
import { selectVideoId, selectVideoMetadata } from "../features/video/videoSlice";
import { selectSizes } from "../features/transcode/transcodeSlice";
import { TranscodeLinearProgressWithLabel } from "./TranscodeLinearProgressWithLabel";
import { useBatchTranscodeMutation, useTranscodePartMutation } from "../features/videoList/videoListSlice";

export const TranscodeButtons = () => {
  const videoId = useAppSelector(selectVideoId);
  const sizes = useAppSelector(selectSizes);
  const metadata = useAppSelector(selectVideoMetadata);
  let availableSizes = ["144", "240", "360", "480", "720", "1080", "1440", "2160"];

  const [transcodePart, { isError }] = useTranscodePartMutation();
  const [batchTranscode, { }] = useBatchTranscodeMutation();

  if (!videoId) {
    return (<></>)
  }

  const handleTrascode = (size: number) => {
    transcodePart({ videoId, size });
  }

  const handleTranscodeAll = () => {
    console.log("missingTranscodeSizes", missingTranscodeSizes);
    batchTranscode({ videoId, sizes: missingTranscodeSizes })
  }

  if (metadata && metadata.height) {
    availableSizes = availableSizes.filter(size => Number(size) < metadata.height + 1);
  }

  const missingTranscodeSizes: string[] = [];

  const buttons = availableSizes.map(size => {
    if (sizes.indexOf(size) === -1) {
      missingTranscodeSizes.push(size);
    }
    return (
      <Stack key={size} sx={{ mt: 4, alignItems: "center" }} direction={"row"} spacing={2}>
        <Button disabled={sizes.indexOf(size) >= 0} variant="contained" onClick={() => handleTrascode(+size)}>{`${size}p`}</Button>
        <Box sx={{ width: '100%' }}>
          <TranscodeLinearProgressWithLabel size={size} />
        </Box>
      </Stack>
    )
  })

  return (
    <Paper>
      <Box sx={{ px: 4, py: 2, mb: 2 }}>
        <Box sx={{ mt: 4 }}>
          <Button
            disabled={!missingTranscodeSizes.length}
            variant="contained"
            onClick={() => handleTranscodeAll()}
          >Transcode All</Button>
        </Box>
        {buttons}
      </Box>
    </Paper>
  )
}