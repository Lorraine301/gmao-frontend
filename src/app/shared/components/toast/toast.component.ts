import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../../../core/services/websocket.service';
import { Subscription } from 'rxjs';

interface ToastItem {
  id: number;
  message: string;
  type: string;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts" class="toast" [ngClass]="'toast--' + t.type.toLowerCase()">
        {{ t.message }}
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      padding: 14px 18px;
      border-radius: 10px;
      background: #1E3A5F;
      color: white;
      font-size: 0.85rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      max-width: 320px;
      animation: slideIn 0.3s ease-out;
    }
    .toast--critical { background: #c0392b; }
    .toast--warning { background: #e65100; }
    .toast--info { background: #2E75B6; }
    @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {

  toasts: ToastItem[] = [];
  private sub?: Subscription;
  private nextId = 0;

  constructor(private wsService: WebsocketService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.sub = this.wsService.notification$.subscribe((notif) => {
      const id = this.nextId++;
      this.toasts.push({ id, message: notif.message, type: notif.type });
      this.cdr.detectChanges();

      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
        this.cdr.detectChanges();
      }, 6000);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}