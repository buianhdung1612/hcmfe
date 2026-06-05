import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.PROD 
  ? 'https://hcm202-3yyu.onrender.com/' 
  : 'http://localhost:5000';

export const socket = io(BACKEND_URL);
