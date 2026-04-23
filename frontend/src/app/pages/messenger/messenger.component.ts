import { Component } from '@angular/core';

interface ChatContact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss',
  standalone: false,
})
export class MessengerComponent {
  contacts: ChatContact[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'assets/images/avatar/avatar-1.jpg',
      lastMessage: 'See you in class tomorrow!',
      time: '2m ago',
      unread: 2,
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: 'assets/images/avatar/avatar-2.jpg',
      lastMessage: 'Thanks for the help with the assignment',
      time: '1h ago',
      unread: 0,
    },
    {
      id: 3,
      name: 'Emma Davis',
      avatar: 'assets/images/avatar/avatar-3.jpg',
      lastMessage: 'When is our next study session?',
      time: '3h ago',
      unread: 0,
    },
  ];

  messages: Message[] = [
    { id: 1, text: 'Hi! Do you have questions about the course?', sender: 'other', time: '10:30' },
    { id: 2, text: 'Yes, I need help with the grammar exercise', sender: 'me', time: '10:32' },
    { id: 3, text: 'Sure, I can explain it. Which part?', sender: 'other', time: '10:33' },
    { id: 4, text: 'The conditional tense section', sender: 'me', time: '10:34' },
    { id: 5, text: 'I\'ll send you some examples shortly!', sender: 'other', time: '10:35' },
  ];

  selectedContact: ChatContact | null = this.contacts[0];
  newMessage = '';

  selectContact(contact: ChatContact): void {
    this.selectedContact = contact;
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.messages.push({
        id: this.messages.length + 1,
        text: this.newMessage,
        sender: 'me',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      });
      this.newMessage = '';
    }
  }
}
