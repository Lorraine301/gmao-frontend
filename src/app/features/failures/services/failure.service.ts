import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Failure, FailureFilters, FailureRequest } from '../models/failure.model';
import { AiAnalysis } from '../models/ai-analysis.model';

@Injectable({ providedIn: 'root' })
export class FailureService {
  private readonly url = `${environment.apiUrl}/failures`;

  constructor(private http: HttpClient) {}

  findAll(filters?: FailureFilters): Observable<Failure[]> {
    let params = new HttpParams();
    if (filters?.status)      params = params.set('status', filters.status);
    if (filters?.priority)    params = params.set('priority', filters.priority);
    if (filters?.equipmentId) params = params.set('equipmentId', filters.equipmentId.toString());
    return this.http.get<Failure[]>(this.url, { params });
  }

  findById(id: number): Observable<Failure> {
    return this.http.get<Failure>(`${this.url}/${id}`);
  }

  findUrgent(): Observable<Failure[]> {
    return this.http.get<Failure[]>(`${this.url}/urgent`);
  }

  declare(dto: FailureRequest): Observable<Failure> {
    return this.http.post<Failure>(this.url, dto);
  }

  updateStatus(id: number, status: string): Observable<Failure> {
    return this.http.put<Failure>(`${this.url}/${id}/status`, { status });
  }

  updatePriority(id: number, priority: string): Observable<Failure> {
    return this.http.put<Failure>(`${this.url}/${id}/priority`, { priority });
  }
  close(id: number): Observable<Failure> {
  return this.http.put<Failure>(`${this.url}/${id}/close`, {});
  }
  getAnalysis(failureId: number): Observable<AiAnalysis> {
  return this.http.get<AiAnalysis>(`${this.url}/${failureId}/analysis`);
}

  retryAnalysis(failureId: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${failureId}/analysis/retry`, {});
  }
}