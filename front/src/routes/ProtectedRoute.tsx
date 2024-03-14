import { Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectIsLoggedIn } from '../features/login/loginSlice';
import { useEffect } from 'react';

const ProtectedRoute = () => {
    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, [isLoggedIn, navigate])

    return (
        <>
            {
                isLoggedIn ? <Outlet /> : <div>You are not logged in!</div>
            }
        </>
    )
}

export default ProtectedRoute;