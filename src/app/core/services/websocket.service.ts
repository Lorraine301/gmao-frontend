import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../../core/models/notification.model';

@Injectable({ providedIn: 'root' })
export class WebsocketService {

  private client?: Client;
  private notificationSubject = new Subject<AppNotification>();
  notification$ = this.notificationSubject.asObservable();

  connect(token: string): void {
    if (this.client?.active) return; // déjà connecté

    const wsUrl = environment.apiUrl.replace('/api', '') + '/ws?token=' + encodeURIComponent(token);

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as any,
      reconnectDelay: 5000, // reconnexion auto si la connexion tombe
      onConnect: () => {
        this.client!.subscribe('/user/queue/notifications', (message: IMessage) => {
          const notification: AppNotification = JSON.parse(message.body);
          this.notificationSubject.next(notification);
        });
      },
      onStompError: (frame) => {
        console.warn('[WebSocket] Erreur STOMP :', frame);
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = undefined;
  }
}