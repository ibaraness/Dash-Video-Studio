// MUI direct checked
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
import { selectIsLoggedIn, selectRefreshAttempts, setIsLoggedIn, setUsername } from '../features/login/loginSlice';
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getUserInfo, refreshUserToken, signupUser } from '../services/restApi/restAPI';

export const SignUp = () => {

    const formik = useFormik({
        initialValues: {
            username: 'Idan2',
            password: 'Lilahila@123',
            passwordConfirm: 'Lilahila@123',
            email: 'idan.baraness@gmail.com',
        },
        validationSchema: Yup.object({
            username: Yup.string()
                .max(15, 'Must be 15 characters or less')
                .min(2, 'Must have at least 2 character')
                .matches(/^(\S+$)/g, 'White space is not allowd')
                .required('Required'),
            password: Yup.string()
                .max(20, 'Must be 20 characters or less')
                .min(8, 'Must have at least 8 character')
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                    'Password must contain both uppercase and lower case letters, numbers and special characters'
                )
                .required('Required'),
            passwordConfirm: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match'),
            email: Yup.string().email('Invalid email address').required('Required'),
        }),
        onSubmit: ({username, password, email}) => {
            signupAsync({username, password, email});
        },
    });

    const [signupError, setSignupError] = useState("");

    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const refreshAttempts = useAppSelector(selectRefreshAttempts);

    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const signupAsync = async (credentials: { username: string, password: string, email: string }) => {
        try {
            const res = await signupUser(credentials);
            if(res.isError){
                setSignupError(res.errorMessage || "Unknown error occurred, please try again later!");
                return;
            }
            dispatch(setIsLoggedIn(true));
        } catch (err) {
            setSignupError("Unknown error occurred, please try again later!");
        }
    }

    useEffect(() => {
        async function refresh() {
            try {
                const res = await refreshUserToken();
                if(res.isError){
                    return;
                }
                const userInfo = await getUserInfo();
                dispatch(setUsername(userInfo.data?.username || ""));
                dispatch(setIsLoggedIn(true));
            } catch (e) {
                console.error("e", e)
            }
        }
        if (isLoggedIn) {
            navigate("/");
        } else if (refreshAttempts < 2) {
            refresh();
        }

    }, [isLoggedIn, dispatch, navigate, refreshAttempts])

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
                <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1, maxWidth: "400px" }}>
                    <TextField
                        error={formik.touched.username && !!formik.errors.username}
                        helperText={formik.touched.username && formik.errors.username}
                        margin="normal"
                        size="small"
                        required={true}
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.username}

                    />
                    <TextField
                        error={formik.touched.email && !!formik.errors.email}
                        helperText={formik.touched.email && formik.errors.email}
                        margin="normal"
                        size="small"
                        type="email"
                        required={true}
                        fullWidth
                        id="email"
                        label="email"
                        name="email"
                        autoComplete="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}

                    />
                    <TextField
                        error={formik.touched.password && !!formik.errors.password}
                        helperText={formik.touched.password && formik.errors.password}
                        margin="normal"
                        size="small"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
                    <TextField
                        error={formik.touched.passwordConfirm && !!formik.errors.passwordConfirm}
                        helperText={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
                        margin="normal"
                        size="small"
                        required
                        fullWidth
                        name="passwordConfirm"
                        label="passwordConfirm"
                        type="password"
                        id="passwordConfirm"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.passwordConfirm}
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
                            <Link component={RouterLink} to={"/login"} variant="body2">
                                {"Already have an account? Sign In"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Paper>
    );
}