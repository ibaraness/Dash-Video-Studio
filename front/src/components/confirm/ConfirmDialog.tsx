import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectConfirmAction, selectConfirmCallId, selectConfirmMessage, selectConfirmTitle, selectIsConfirmOpen, setConfirmCallId, setConfirmOpen } from "../../features/confirm/confirmSlice";
import eventEmitter from "../DashPlayer/utils/eventEmitter";

export interface ConfirmResponse {
    id: number | string,
    action: string;
    approved: boolean;
}

const ConfirmDialog = () => {

    const isOpen = useAppSelector(selectIsConfirmOpen);
    const message = useAppSelector(selectConfirmMessage);
    const title = useAppSelector(selectConfirmTitle);
    const action = useAppSelector(selectConfirmAction);
    const callId = useAppSelector(selectConfirmCallId);

    const dispatch = useAppDispatch();

    const handleClose = (approved: boolean) => {
        const answer: ConfirmResponse = {id: callId, action, approved};
        eventEmitter.emit('confirmAnswer', answer);
        dispatch(setConfirmOpen(false));
        dispatch(setConfirmCallId(0));
    }

    return (
        <Dialog
        open={isOpen}
        onClose={() => {handleClose(false)}}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => {handleClose(false)}}>
            Disagree
          </Button>
          <Button onClick={() => {handleClose(true)}} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    )
}

export default ConfirmDialog;