import { Component, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssistantService } from '../../services/assistant.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ChatMessage } from '../../models/chat-message.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewChecked {

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  isOpen = false;
  messages: ChatMessage[] = [];
  currentInput = '';
  isSending = false;
  hasError = false;

  private shouldScroll = false;

  constructor(
    private assistantService: AssistantService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.messages.push({
        role: 'assistant',
        content: 'Bonjour 👋 Je suis votre assistant GMAO. Posez-moi une question sur vos équipements, pannes ou interventions.',
        timestamp: new Date()
      });
    }
  }

  sendMessage(): void {
    const text = this.currentInput.trim();
    if (!text || this.isSending) return;

    this.messages.push({ role: 'user', content: text, timestamp: new Date() });
    this.currentInput = '';
    this.isSending = true;
    this.hasError = false;
    this.shouldScroll = true;

    this.assistantService.chat(text).subscribe({
      next: (response) => {
        this.messages.push({ role: 'assistant', content: response.reply, timestamp: new Date() });
        this.isSending = false;
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSending = false;
        this.hasError = true;
        this.shouldScroll = true;
        this.cdr.detectChanges();
      }
    });
  }

  retryLastMessage(): void {
    // Retire le dernier message utilisateur pour le renvoyer proprement
    const lastUserMessage = [...this.messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      this.hasError = false;
      this.currentInput = lastUserMessage.content;
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}