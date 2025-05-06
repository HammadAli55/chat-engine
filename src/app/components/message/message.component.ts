import { Component, Input } from '@angular/core';
import { Message } from '../../models/message.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() message!: Message;
  @Input() currentUser: string = '';

  userColor: string = '';

  ngOnInit(): void {
    // Generate consistent color based on username
    this.userColor = this.isSystem ? '#888888' : this.generateColorFromString(this.message.username);
  }

  get isCurrentUser(): boolean {
    return this.message.username === this.currentUser;
  }

  get isSystem(): boolean {
    return this.message.username === 'System' || !!this.message.isSystem;
  }

  get messageClass(): string {
    if (this.isSystem) return 'system';
    return this.isCurrentUser ? 'sent' : 'received';
  }

  // Generate a consistent color based on username string
  private generateColorFromString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate color in HSL to ensure good readability
    // Use 50% saturation and 60% lightness for better readability
    // Vary only the hue based on username
    const hue = Math.abs(hash % 360);

    // For sent messages, we'll still use a standard color (handled in CSS)
    if (this.isCurrentUser) {
      return '';
    }

    return `hsl(${hue}, 70%, 45%)`;
  }
}