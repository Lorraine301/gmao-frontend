import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WebsocketService } from './websocket.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  userId: number;
  fullName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'gmao_token';
  private readonly USER_KEY  = 'gmao_user';

  constructor(private http: HttpClient, private router: Router, private wsService: WebsocketService ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
    .pipe(
      timeout(5000),
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response));
        this.wsService.connect(response.token);   // ← ajouté
      })
    );
  }

  logout(): void {
    this.wsService.disconnect();
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): LoginResponse | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return this.getCurrentUser()?.role ?? null;
  }
  updateMyAvailability(availabilityStatus: 'Available' | 'Unavailable'): Observable<void> {
  return this.http.put<void>(`${environment.apiUrl}/auth/me/availability`, { availabilityStatus })
    .pipe(tap(() => {
      // Met à jour aussi le cache local pour cohérence immédiate
      const user = this.getCurrentUser();
      if (user) {
        (user as any).availabilityStatus = availabilityStatus;
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }
    }));
  }
}