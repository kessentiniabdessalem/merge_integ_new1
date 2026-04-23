import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../ai/services/ai.service';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-learnbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './learnbot.component.html',
  styleUrls: ['./learnbot.component.scss']
})
export class LearnbotComponent implements OnInit {
  isOpen = false;
  isMinimized = false;
  messages: ChatMessage[] = [];
  userInput = '';
  isTyping = false;
  suggestions: string[] = [
    'How can I improve my quiz scores?',
    'What are the best study techniques?',
    'Explain a difficult concept',
    'Show me my progress'
  ];

  constructor(private aiService: AiService) {}

  ngOnInit(): void {
    // Message de bienvenue
    this.addBotMessage('Hello! I\'m LearnBot, your AI learning assistant. How can I help you today?');
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
    }
  }

  minimizeChat(): void {
    this.isMinimized = !this.isMinimized;
  }

  closeChat(): void {
    this.isOpen = false;
    this.isMinimized = false;
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isTyping) return;

    const userMessage = this.userInput.trim();
    this.addUserMessage(userMessage);
    this.userInput = '';
    this.isTyping = true;

    // Appel à l'API
    this.aiService.chat(userMessage).subscribe({
      next: (response) => {
        this.isTyping = false;
        this.addBotMessage(response.response || response.message || 'I apologize, I couldn\'t generate a response.');
      },
      error: (error) => {
        console.error('Chat error:', error);
        this.isTyping = false;
        this.addBotMessage('Sorry, I encountered an error. Please try again.');
      }
    });
  }

  useSuggestion(suggestion: string): void {
    this.userInput = suggestion;
    this.sendMessage();
  }

  addUserMessage(text: string): void {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  addBotMessage(text: string): void {
    this.messages.push({
      text,
      isUser: false,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const chatBody = document.querySelector('.chat-body');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }, 100);
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.messages = [];
      this.addBotMessage('Chat cleared! How can I help you?');
    }
  }
}
