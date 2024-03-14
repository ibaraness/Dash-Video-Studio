// MUI direct checked
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectIsOpen, selectMessage, selectSeverity, setOpen } from "../../features/notification/notificationSlice";

const NotificationSnack = () => {

    const isOpen = useAppSelector(selectIsOpen);
    const message = useAppSelector(selectMessage);
    const severity = useAppSelector(selectSeverity);
    const dispatch = useAppDispatch();

    const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        dispatch(setOpen(false));
    };

    return (
        <div>
            <Snackbar open={isOpen} autoHideDuration={6000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity={severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default NotificationSnack;