// MUI direct checked
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

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
        dispatch(setConfirmCallId(""));
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