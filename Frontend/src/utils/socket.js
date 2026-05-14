import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '');

export const socket = io(SOCKET_URL, {
    path: '/socket.io/',
    autoConnect: false,
    withCredentials: true
});

export const connectSocket = (vendorId) => {
    if (!socket.connected) {
        socket.connect();
    }
    // Always emit join_vendor to ensure the room is joined correctly
    socket.emit('join_vendor', vendorId);
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
