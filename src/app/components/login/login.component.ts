import { Component, EventEmitter, Output } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MessageComponent, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = '';
  room: string = '';

  @Output() onJoin = new EventEmitter<{ username: string, room: string }>();

  joinRoom(): void {
    if (!this.username.trim() || !this.room.trim()) {
      alert('Please enter both username and room name');
      return;
    }

    this.onJoin.emit({
      username: this.username.trim(),
      room: this.room.trim()
    });
  }
}