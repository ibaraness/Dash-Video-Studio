// MUI direct checked
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { blue } from '@mui/material/colors';
import React, { useEffect, useRef } from 'react';
import NotificationSnack from './components/notifications/NotificationSnack';
import { getBreakingpoint } from './services/helpers';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { setActiveBreakpoint, setIsMobile, setTopMenuHeight } from './features/ui/uiSlice';
import ConfirmDialog from './components/confirm/ConfirmDialog';
import { Outlet } from "react-router-dom";
import AccountCircle from '@mui/icons-material/AccountCircle';
import { selectIsLoggedIn, selectUsername, setIsLoggedIn } from './features/login/loginSlice';
import { logoutUser } from './services/restApi/restAPI';
import { setMute, setVolume } from './features/videoPlayer/videoPlayerSlice';
import { clearVideoData } from './features/video/videoSlice';
import eventEmitter from './app/utils/eventEmitter';

function App() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const appMenuElemnt = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector(selectIsLoggedIn);
  const username = useAppSelector(selectUsername);

  useEffect(() => {
    function setUi() {
      const breakingPoint = getBreakingpoint(window.innerWidth);
      const isMobile = window.innerWidth <= 900;
      dispatch(setIsMobile(isMobile));
      dispatch(setActiveBreakpoint(breakingPoint));
      if (breakingPoint === "xs") {
        dispatch(setMute(true));
        dispatch(setVolume(100));
      }
      eventEmitter.emit('resize');
    }
    setUi();
    window.addEventListener("resize", setUi);
    return () => {
      window.removeEventListener("resize", setUi);
    }
  });

  useEffect(() => {
    if (appMenuElemnt.current) {
      dispatch(setTopMenuHeight(appMenuElemnt.current.offsetHeight));
    }
    function handleResize() {
      if (appMenuElemnt.current) {
        dispatch(setTopMenuHeight(appMenuElemnt.current.offsetHeight));
      }
    }
    const listener = eventEmitter.addListener("resize", handleResize);
    return () => {
      listener.remove();
    }
  }, [appMenuElemnt, dispatch])

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logMeOut = async () => {
    try {
      const res = await logoutUser();
      if (res.isError) {
        console.error("logout", res.errorMessage);
        return;
      }
      dispatch(setIsLoggedIn(false));
      //clean video
      dispatch(clearVideoData());
      handleClose();
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="fixed" ref={appMenuElemnt} sx={{ display: { xs: "block", md: "block" } }}>
        <Toolbar>
          <Box sx={{
            backgroundColor:"white", 
            width:{xs:"30px", md:"50px"}, 
            height:{xs:"30px", md:"50px"},  
            borderRadius:"50%", 
            p:{xs:"1px", md:"3px"}, 
            mr:1}}>
            <img src='/logo-no-background.png' width={"100%"} alt='Dash Video Studio logo' />
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dash Video Studio
          </Typography>
          {loggedIn && (
            <Box>
              <Stack direction={"row"} justifyContent={"center"} alignItems={"center"}>
                <Typography variant="subtitle1">{username}</Typography>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>

              </Stack>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={logMeOut}>Log-out</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{
        px: { xs: 0, md: 2 },
        backgroundColor: blue[50],
        minHeight: "100vh",
        py: { md: 4 },
        mt: { xs: 0, md: 7 }
      }}>
        <Outlet />
      </Container>
      <NotificationSnack></NotificationSnack>
      <ConfirmDialog></ConfirmDialog>
    </React.Fragment>
  )
}

export default App


