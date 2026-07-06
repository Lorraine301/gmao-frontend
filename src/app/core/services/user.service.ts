import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  employeeCode: string;
  speciality?: string;
  availabilityStatus: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly url = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}
  getTechnicians(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.url}/technicians`);
  }
}