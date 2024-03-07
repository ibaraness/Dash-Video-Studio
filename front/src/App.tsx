import { Typography, Container, AppBar, IconButton, Toolbar, CssBaseline, Menu, MenuItem, Box, Stack } from '@mui/material';
import { blue } from '@mui/material/colors';
import React, { useEffect, useRef } from 'react';
import NotificationSnack from './components/notifications/NotificationSnack';
import { getBreakingpoint } from './services/helpers';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { setActiveBreakpoint, setIsMobile, setTopMenuHeight } from './features/ui/uiSlice';
import eventEmitter from './components/DashPlayer/utils/eventEmitter';
import ConfirmDialog from './components/confirm/ConfirmDialog';
import { Outlet } from "react-router-dom";
import AccountCircle from '@mui/icons-material/AccountCircle';
import { selectIsLoggedIn, setIsLoggedIn } from './features/login/loginSlice';
import { logoutUser } from './services/restAPI';
import { setMute, setVolume } from './features/videoPlayer/videoPlayerSlice';


function App() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const appMenuElemnt = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector(selectIsLoggedIn);

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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Video Studio
          </Typography>
          {loggedIn && (
            <Box>
              <Stack direction={"row"} justifyContent={"center"} alignItems={"center"}>
                
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
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
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


