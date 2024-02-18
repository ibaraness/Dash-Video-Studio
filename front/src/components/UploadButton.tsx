import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ProgressPayload, multipartUpload } from '../services/MultipartUpload';
import { selectVideoInputValue, setPercent, setVideoInputValue, setVideoUploadStatus } from '../features/videoUpload/videoUploadSlice';
import { setVideoId } from '../features/video/videoSlice';
import { UploadedStatus } from '../features/videoUpload/videoUploadSlice.model';
import { useMultiPartUploaderMutation } from '../features/api/apiSlice';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export interface InputFileUploadProps {
  onProgress?: (event: ProgressPayload) => void,
  onStart?: () => void,
  onDone?: () => void
}

const InputFileUpload = () => {

  const videoValue = useAppSelector(selectVideoInputValue);
  const dispatch = useAppDispatch();

  // const [uploadFile, { isLoading, isError, error }] = useMultiPartUploaderMutation();

  const handleUpload = (event: EventTarget & HTMLInputElement) => {
    dispatch(setVideoInputValue(event.value));
    const file = event.files && event.files[0];
    if (file) {
      dispatch(setPercent(0));
      multipartUpload(file, (event) => {
        dispatch(setPercent(event.percent));
      },
      (event) => {
        dispatch(setVideoId(event.id))
        dispatch(setVideoUploadStatus(UploadedStatus.Complete));
        console.log("response", event);
      })
    }
    // console.log(file);
  }
  return (
    <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
      Upload video
      <VisuallyHiddenInput value={videoValue} onChange={event => handleUpload(event.target)} type="file" />
    </Button>
  );
}

export default InputFileUpload;