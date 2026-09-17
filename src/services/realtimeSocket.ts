import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getRealtimeSocket(serverUrl = window.location.origin): Socket {
  if (!socketInstance) {
    socketInstance = io(serverUrl, {
      autoConnect: false,
      reconnectionAttempts: 5,
      timeout: 10000,
      auth: (cb) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("app_auth_token") || "" : "";
        cb({ token });
      }
    });
  }
  return socketInstance;
}

export function connectRealtimeSocket() {
  try {
    const socket = getRealtimeSocket();
    if (!socket.connected) {
      socket.connect();
    }
  } catch (err) {
    console.warn("[RealtimeSocket] socket.io server is not configured on this backend. Real-time features will be unavailable.", err);
  }
}

export function disconnectRealtimeSocket() {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
  }
}
