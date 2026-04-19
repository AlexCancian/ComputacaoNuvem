import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./api";

class SocketService {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3335";
  }

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.url, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        transports: ["websocket", "polling"],
        auth: (cb) => {
          cb({ token: getAccessToken() });
        }
      });

      this.socket.on("connect", () => {
        console.log("Conectado ao WebSocket do Backend:", this.socket?.id);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Desconectado do WebSocket:", reason);
      });
    }
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
