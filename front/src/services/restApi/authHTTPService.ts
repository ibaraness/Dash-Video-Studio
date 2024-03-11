import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { AccessTokenRespons, CustomResponse, LoginCresentials, SignUpCredentials } from "./restAPI.model";
import { getAccessToken, setAccessToken } from "../tokenProvider";

class AuthHTTPService {

    async signupUser(credentials: SignUpCredentials): Promise<CustomResponse> {
        const res = await this.post<SignUpCredentials, AccessTokenRespons>('/auth/signup', credentials, { withCredentials: true });
        if (res.data) {
            setAccessToken(res.data!.access_token);
        }
        return res;
    }

    async loginUser(credentials: LoginCresentials): Promise<CustomResponse> {
        const res = await this.post<LoginCresentials, AccessTokenRespons>('/auth/login', credentials, { withCredentials: true });
        if (res.data) {
            setAccessToken(res.data!.access_token);
        }
        return res;
    }

    async refreshUserToken(): Promise<CustomResponse<AccessTokenRespons | null>> {
        const res = await this.post<undefined, AccessTokenRespons>('/auth/refresh', undefined, { withCredentials: true }, true);
        console.log("refreshUserToken2")
        if (res.data) {
            setAccessToken(res.data!.access_token);
        }
        return res;
    }

    async isLoggedIn() {
        const res = await this.refreshUserToken();
        return !!res.data;
    }

    async logoutUser(): Promise<CustomResponse> {
        const res = await this.post<undefined, { message: string }>('/auth/signout', undefined, {
            withCredentials: true,
        });
        if (res.statusCode == 401) {
            console.log("401 permission problem!")
        }
        return res;
    }

    // Get
    async get<S = unknown>(
        url: string,
        config?: AxiosRequestConfig | undefined,
        skipIsLogged?: boolean
    ): Promise<CustomResponse<S | null>> {
        try {
            const res = await axios.get<S>(url, { ...config, headers: { 'Authorization': `Bearer ${getAccessToken() || ""}` } });
            return this.generateResponse<S>(res);
        } catch (err) {
            const error = this.generateErrorResponse<S>(err);
            if (error.statusCode === 401 && !skipIsLogged) {
                const isLoggedIn = await this.isLoggedIn();
                if (isLoggedIn) {
                    return this.get(url, config, true);
                }
            }
            return error;
        }
    }

    // Post
    async post<T = unknown, S = unknown>(
        url: string,
        data: T,
        config?: AxiosRequestConfig | undefined,
        skipIsLogged?: boolean
    ): Promise<CustomResponse<S | null>> {
        try {
            const res = await axios.post<S>(url, data, { ...config, headers: { 'Authorization': `Bearer ${getAccessToken() || ""}` } });
            return this.generateResponse<S>(res);
        } catch (err) {
            const error = this.generateErrorResponse<S>(err);
            if (error.statusCode === 401 && !skipIsLogged) {
                const isLoggedIn = await this.isLoggedIn();
                if (isLoggedIn) {
                    return this.post(url, data, config, true);
                }
            }
            return error;
        }
    }

    // Put
    async put<T = unknown, S = unknown>(
        url: string,
        data: T,
        config?: AxiosRequestConfig | undefined,
        skipIsLogged?: boolean
    ): Promise<CustomResponse<S | null>> {
        try {
            const res = await axios.put<S>(url, data, { ...config, headers: { 'Authorization': `Bearer ${getAccessToken() || ""}` } },);
            return this.generateResponse<S>(res);
        } catch (err) {
            const error = this.generateErrorResponse<S>(err);
            if (error.statusCode === 401 && !skipIsLogged) {
                const isLoggedIn = await this.isLoggedIn();
                if (isLoggedIn) {
                    return this.put(url, data, config, true);
                }
            }
            return error;
        }
    }

    // Delete
    async delete<S = unknown>(
        url: string,
        config?: AxiosRequestConfig | undefined,
        skipIsLogged?: boolean
    ): Promise<CustomResponse<S | null>> {
        try {
            const res = await axios.delete<S>(url, { ...config, headers: { 'Authorization': `Bearer ${getAccessToken() || ""}` } });
            return this.generateResponse<S>(res);
        } catch (err) {
            const error = this.generateErrorResponse<S>(err);
            if (error.statusCode === 401 && !skipIsLogged) {
                const isLoggedIn = await this.isLoggedIn();
                if (isLoggedIn) {
                    return this.delete(url, config, true);
                }
            }
            return error;
        }
    }

    private generateResponse<S = unknown>(res: AxiosResponse<S, unknown>): CustomResponse<S | null> {
        return {
            isError: false,
            errorMessage: "",
            statusCode: res.status,
            result: "success",
            data: res.data
        };
    }

    private generateErrorResponse<S = unknown>(err: unknown): CustomResponse<S | null> {
        if (err instanceof AxiosError) {
            return { ...this.generalErrorResponse<S>(), errorMessage: err.response?.data.message, statusCode: err.response?.status || 500 }
        }
        return this.generalErrorResponse<S>();
    }

    private generalErrorResponse<S = unknown>(): CustomResponse<S | null> {
        return {
            isError: true,
            errorMessage: "Unknown error occurred, please try again later!",
            data: null,
            statusCode: 500,
            result: "failure"
        }
    }
}
const authHttpService = new AuthHTTPService();
export default authHttpService;