// MUI direct checked
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectIsLoggedIn, selectRefreshAttempts, setIsLoggedIn, setRefreshAttempts } from '../features/login/loginSlice';
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from 'react';
import { loginUser, refreshUserToken } from '../services/restApi/restAPI';

const LoginPage = () => {

    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const refreshAttempts = useAppSelector(selectRefreshAttempts);

    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const [signupError, setSignupError] = useState("");

    const loginAsync = async (credentials: { username: string, password: string }) => {
        try {
            const res = await loginUser(credentials);
            if(res.isError){
                setSignupError(res.errorMessage || "Unknown error occurred, please try again later!");
                return;
            }
            dispatch(setIsLoggedIn(true));
        } catch (err) {
            // Handle error here
            console.error(err)
        }
    }

    useEffect(() => {
        async function refresh() {
            try {
                const res = await refreshUserToken();
                if(res.isError){
                    return;
                }
                dispatch(setIsLoggedIn(true));
            } catch (e) {
                console.error("e", e)
            }
        }
        if (isLoggedIn) {
            navigate("/");
        } else if(refreshAttempts < 1) {
            dispatch(setRefreshAttempts(refreshAttempts + 1));
            refresh();
        }

    }, [isLoggedIn, dispatch, navigate, refreshAttempts])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const credentials = {
            username: data.get('username')?.toString() || "",
            password: data.get('password')?.toString() || "",
        }
        loginAsync(credentials);
    };

    return (
        <Paper sx={{
            paddingTop: 8,
            paddingBottom: 10,
            width: { xs: "100%", md: "60%" },
            height: { xs: "100vh", md: "auto" },
            marginLeft: "auto",
            marginRight: "auto"
        }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: { xs: "10px", md: 0 }
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, maxWidth: "400px" }}>
                    <TextField
                        margin="normal"
                        size="small"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        defaultValue={"idan"}
                    />
                    <TextField
                        margin="normal"
                        size="small"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        defaultValue={"Lilahila@123"}
                        autoComplete="current-password"
                    />
                    {
                        signupError && <Alert severity="error">{signupError}</Alert>
                    }
                    {/* <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    /> */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        {/* <Grid item xs>
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid> */}
                        <Grid item>
                            <Link component={RouterLink} to={"/sign-up"} variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Paper>
    );
}

export default LoginPage