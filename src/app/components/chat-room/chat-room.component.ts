import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../models/message.model';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from '../message/message.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [FormsModule, MessageComponent, CommonModule],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.scss'
})
export class ChatRoomComponent {
  @Input() username: string = '';
  @Input() roomName: string = '';
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: Message[] = [];
  messageInput: string = '';
  searchQuery: string = '';
  searchResults: Message[] = [];
  showSearchResults: boolean = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Join room
    this.chatService.joinRoom(this.username, this.roomName);
    
    // Listen for new messages
    this.subscriptions.push(
      this.chatService.onNewMessage().subscribe(message => {
        this.messages.push(message);
      })
    );
    
    // Listen for user joined notifications
    this.subscriptions.push(
      this.chatService.onUserJoined().subscribe(message => {
        this.messages.push(message);
      })
    );
    
    // Listen for room history
    this.subscriptions.push(
      this.chatService.onRoomHistory().subscribe(messages => {
        this.messages = messages;
      })
    );
    
    // Listen for search results
    this.subscriptions.push(
      this.chatService.onSearchResults().subscribe(results => {
        this.searchResults = results;
        this.showSearchResults = true;
      })
    );
    
    // Listen for search errors
    this.subscriptions.push(
      this.chatService.onSearchError().subscribe(error => {
        alert('Search failed: ' + error.message);
      })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Disconnect from socket
    this.chatService.disconnect();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (!this.messageInput.trim()) return;
    
    const message: Message = {
      username: this.username,
      message: this.messageInput.trim(),
      room: this.roomName,
      timestamp: new Date()
    };
    
    this.chatService.sendMessage(message);
    this.messageInput = '';
  }

  searchMessages(): void {
    if (!this.searchQuery.trim()) return;
    
    this.chatService.searchMessages(this.searchQuery.trim(), this.roomName);
  }

  closeSearch(): void {
    this.showSearchResults = false;
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
