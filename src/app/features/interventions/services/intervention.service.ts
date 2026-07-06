import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AtRiskEquipment, Intervention } from '../models/intervention.model';

@Injectable({ providedIn: 'root' })
export class InterventionService {
  private readonly url = `${environment.apiUrl}/interventions`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(this.url);
  }

  findMy(): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${this.url}/my`);
  }

  create(failureId: number, technicianId: number): Observable<Intervention> {
    return this.http.post<Intervention>(this.url, { failureId, technicianId });
  }

  updateStatus(id: number, status: string): Observable<Intervention> {
    return this.http.put<Intervention>(`${this.url}/${id}/status`, { status });
  }

  complete(id: number, solution: string): Observable<Intervention> {
    return this.http.put<Intervention>(`${this.url}/${id}/complete`, { solution });
  }

  getAtRiskEquipments(): Observable<AtRiskEquipment[]> {
    return this.http.get<AtRiskEquipment[]>(`${environment.apiUrl}/equipments/at-risk`);
  }
}