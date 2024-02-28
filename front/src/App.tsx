import { Typography, Container, Button, AppBar, IconButton, Toolbar, CssBaseline } from '@mui/material';
import { blue } from '@mui/material/colors';
import MenuIcon from '@mui/icons-material/Menu';
import React, { useEffect } from 'react';
import VideoStudio from './components/studio/VideoStudio';
import NotificationSnack from './components/notifications/NotificationSnack';
import { getBreakingpoint } from './services/helpers';
import { useAppDispatch } from './app/hooks';
import { setActiveBreakpoint, setIsMobile } from './features/ui/uiSlice';
import eventEmitter from './components/DashPlayer/utils/eventEmitter';
import ConfirmDialog from './components/confirm/ConfirmDialog';



function App() {

  const dispatch = useAppDispatch();

  useEffect(()=>{
    function setUi(){
      const breakingPoint = getBreakingpoint(window.innerWidth);
      const isMobile = window.innerWidth <= 900;
      dispatch(setIsMobile(isMobile));
      dispatch(setActiveBreakpoint(breakingPoint));
      eventEmitter.emit('resize');
    }
    setUi();
    window.addEventListener("resize", setUi);
    return () => {
      window.removeEventListener("resize", setUi);
    }
  })

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="fixed" sx={{display:{xs:"none", md:"block"}}}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Video Studio
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{
        px:{xs:0, md:2}, 
        backgroundColor: blue[50], 
        minHeight: "100vh", 
        py: {md:4}, 
        // pt:{xs:"calc(100vw * (9/16))"}, 
        mt:{xs:0, md:7} 
        }}>
        <VideoStudio></VideoStudio>
      </Container>
      <NotificationSnack></NotificationSnack>
      <ConfirmDialog></ConfirmDialog>
    </React.Fragment>
  )
}

export default App


