import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

export type RealtimeEvent = {
  type: 'message' | 'match' | 'connection' | string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

class RealtimeService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string): void {
    if (this.socket && this.token === token) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.token = token;
    this.socket = io(API_BASE_URL, {
      transports: ['websocket'],
      forceNew: true,
      autoConnect: true,
      auth: { token: `Bearer ${token}` },
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.token = null;
  }

  onMessageReceived(callback: (payload: { message: Record<string, unknown> }) => void): void {
    this.socket?.on('message_received', callback);
  }

  onNotification(callback: (notification: RealtimeEvent) => void): void {
    this.socket?.on('notification', callback);
  }

  onMessageSent(callback: (payload: { message: Record<string, unknown> }) => void): void {
    this.socket?.on('message_sent', callback);
  }

  onMessageError(callback: (payload: { error: string }) => void): void {
    this.socket?.on('message_error', callback);
  }

  sendMessage(receiverId: string, content: string): void {
    this.socket?.emit('send_message', { receiverId, content });
  }

  joinRoom(roomId: string): void {
    this.socket?.emit('join_room', roomId);
  }

  leaveRoom(roomId: string): void {
    this.socket?.emit('leave_room', roomId);
  }
}

export const realtimeService = new RealtimeService();
