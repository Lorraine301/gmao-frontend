import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../../features/users/models/user.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/auth/me`);
  }
  
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
  return this.http.put<void>(`${environment.apiUrl}/auth/change-password`, {
    currentPassword,
    newPassword
  });
 }
}