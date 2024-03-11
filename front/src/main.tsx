import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme.ts';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import ErrorPage from './error-page.tsx';
import LoginPage from './routes/LoginPage.tsx';
import VideoStudio from './routes/VideoStudio.tsx';
import ProtectedRoute from './routes/ProtectedRoute.tsx';
import SignUp from './routes/SignUp.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            path:'/',
            element: <VideoStudio></VideoStudio>
          }
        ]
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'sign-up',
        element: <SignUp />
      }
    ]
  },

]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>

    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
)
