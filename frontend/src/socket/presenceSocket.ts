import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getBaseOrigin = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return apiUrl.startsWith('http') ? new URL(apiUrl).origin : window.location.origin;
};

export const connectPresenceSocket = (): Socket => {
  if (socket?.connected) return socket;
  if (socket) socket.disconnect();
  socket = io(getBaseOrigin(), {
    withCredentials: true,
    transports: ['websocket'],
  });
  return socket;
};

export const disconnectPresenceSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};