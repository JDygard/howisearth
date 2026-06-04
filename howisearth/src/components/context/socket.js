import { createContext } from 'react';
import { io } from 'socket.io-client';

// Backend serves the site and the websocket on the same port (4000).
export const socket = io('http://localhost:4000');
export const SocketContext = createContext();
