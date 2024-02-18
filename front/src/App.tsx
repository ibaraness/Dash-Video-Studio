import { Typography, Container, Button, AppBar, IconButton, Toolbar, CssBaseline } from '@mui/material';
import { blue } from '@mui/material/colors';
import MenuIcon from '@mui/icons-material/Menu';
import React from 'react';
import VideoStudio from './components/studio/VideoStudio';

function App() {

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="fixed">
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
      <Container maxWidth="lg" sx={{ backgroundColor: blue[50], minHeight: "100vh", py: 4, mt:7 }}>
        <VideoStudio></VideoStudio>
      </Container>
    </React.Fragment>
  )
}

export default App


