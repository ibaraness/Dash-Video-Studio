import { io } from 'socket.io-client';
import { AppConfig } from '../app/config/config';

const baseURL = AppConfig.API.baseURL;
export const socket = io(baseURL);

