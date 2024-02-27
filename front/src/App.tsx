import { Typography, Container, Button, AppBar, IconButton, Toolbar, CssBaseline } from '@mui/material';
import { blue } from '@mui/material/colors';
import MenuIcon from '@mui/icons-material/Menu';
import React from 'react';
import VideoStudio from './components/studio/VideoStudio';
import NotificationSnack from './components/notifications/NotificationSnack';

function App() {

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
        pt:{xs:"calc(100vw * (9/16))"}, 
        mt:{xs:0, md:7} 
        }}>
        <VideoStudio></VideoStudio>
      </Container>
      <NotificationSnack></NotificationSnack>
    </React.Fragment>
  )
}

export default App


