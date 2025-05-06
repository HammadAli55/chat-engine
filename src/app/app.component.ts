import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoginComponent, ChatRoomComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ng-chatApp';

  isLoggedIn: boolean = false;
  currentUser: string = '';
  currentRoom: string = '';

  onLogin(data: { username: string, room: string }): void {
    this.currentUser = data.username;
    this.currentRoom = data.room;
    this.isLoggedIn = true;
  }
}
