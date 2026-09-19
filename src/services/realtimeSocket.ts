import { io, Socket } from "socket.io-client";
import { ensureSessionToken, getAuthToken } from "../utils/apiAuth";

let socketInstance: Socket | null = null;

export function getRealtimeSocket(serverUrl = window.location.origin): Socket {
  if (!socketInstance) {
    socketInstance = io(serverUrl, {
      autoConnect: false,
      reconnectionAttempts: 3,
      timeout: 8000,
      auth: async (cb) => {
        try {
          const token = await ensureSessionToken();
          cb({ token: token || getAuthToken() || "" });
        } catch {
          cb({ token: getAuthToken() || "" });
        }
      }
    });

    socketInstance.on("connect_error", (err) => {
      // Suppress unhandled connection rejections for realtime
      console.debug("[RealtimeSocket] Connection status:", err.message);
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
    console.debug("[RealtimeSocket] Real-time socket deferred:", err);
  }
}

export function disconnectRealtimeSocket() {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
  }
}
