// MUI direct checked
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme.ts';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import ErrorPage from './error-page.tsx';
import LoginPage from './routes/LoginPage.tsx';
import ProtectedRoute from './routes/ProtectedRoute.tsx';

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
            index: true,
            async lazy() {
              let {VideoStudio}  = await import("./routes/VideoStudio.tsx");
              return { Component: VideoStudio };
            }
          }
        ]
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'sign-up',
        async lazy(){
          let {SignUp}  = await import("./routes/SignUp.tsx");
              return { Component: SignUp };
        }
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
