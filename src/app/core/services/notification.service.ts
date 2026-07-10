import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class AppNotificationService {
  private readonly url = `${environment.apiUrl}/notifications`;
  constructor(private http: HttpClient) {}

  findMine(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.url);
  }
  countUnread(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.url}/count`);
  }
  markAsRead(id: number): Observable<AppNotification> {
    return this.http.put<AppNotification>(`${this.url}/${id}/read`, {});
  }
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.url}/read-all`, {});
  }
}