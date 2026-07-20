import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRequest } from '../../features/users/models/user.model';

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

  findAll(role?: string): Observable<User[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    return this.http.get<User[]>(this.url, { params });
  }

  findById(id: number): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }

  create(dto: UserRequest): Observable<User> {
    return this.http.post<User>(this.url, dto);
  }

  update(id: number, dto: UserRequest): Observable<User> {
    return this.http.put<User>(`${this.url}/${id}`, dto);
  }

  deactivate(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/deactivate`, {});
  }

  reactivate(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/reactivate`, {});
  }
}