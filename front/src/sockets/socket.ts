import { io } from 'socket.io-client';
import { AppConfig } from '../app/config/config';

const baseURL = AppConfig.API.baseURL;
const socketPath = "/api/events"
export const socket = io(baseURL, {path:socketPath});

