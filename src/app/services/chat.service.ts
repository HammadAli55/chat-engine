import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket!: Socket;
  private readonly SERVER_URL = 'http://localhost:3000';

  constructor() {
    this.connect();
  }

  // Connect to socket server
  connect(): void {
    this.socket = io(this.SERVER_URL);
  }

  // Disconnect from socket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Join chat room
  joinRoom(username: string, room: string): void {
    this.socket.emit('join room', { username, room });
  }

  // Send a message
  sendMessage(message: Message): void {
    this.socket.emit('chat message', message);
  }

  // Search messages
  searchMessages(query: string, room: string): void {
    this.socket.emit('search messages', { query, room });
  }

  // Get new messages
  onNewMessage(): Observable<Message> {
    return new Observable<Message>(observer => {
      this.socket.on('chat message', (data: Message) => {
        observer.next(data);
      });
    });
  }

  // Get user joined notifications
  onUserJoined(): Observable<Message> {
    return new Observable<Message>(observer => {
      this.socket.on('user joined', (data: Message) => {
        observer.next(data);
      });
    });
  }

  // Get room history
  onRoomHistory(): Observable<Message[]> {
    return new Observable<Message[]>(observer => {
      this.socket.on('room history', (messages: Message[]) => {
        observer.next(messages);
      });
    });
  }

  // Get search results
  onSearchResults(): Observable<Message[]> {
    return new Observable<Message[]>(observer => {
      this.socket.on('search results', (results: Message[]) => {
        observer.next(results);
      });
    });
  }

  // Get search errors
  onSearchError(): Observable<{ message: string }> {
    return new Observable<{ message: string }>(observer => {
      this.socket.on('search error', (error: { message: string }) => {
        observer.next(error);
      });
    });
  }
}