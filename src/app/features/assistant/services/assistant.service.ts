import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private readonly url = `${environment.apiUrl}/assistant`;

  constructor(private http: HttpClient) {}

  chat(message: string): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${this.url}/chat`, { message });
  }
}