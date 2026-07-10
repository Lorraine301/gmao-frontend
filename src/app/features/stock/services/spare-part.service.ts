import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SparePart, SparePartRequest } from '../models/spare-part.model';
import { PartConsumption, ConsumptionType } from '../models/spare-part.model';

@Injectable({ providedIn: 'root' })
export class SparePartService {
  private readonly url = `${environment.apiUrl}/spare-parts`;
  constructor(private http: HttpClient) {}

  findAll(lowStock?: boolean): Observable<SparePart[]> {
    let params = new HttpParams();
    if (lowStock !== undefined) params = params.set('lowStock', lowStock.toString());
    return this.http.get<SparePart[]>(this.url, { params });
  }
  findById(id: number): Observable<SparePart> {
    return this.http.get<SparePart>(`${this.url}/${id}`);
  }
  create(dto: SparePartRequest): Observable<SparePart> {
    return this.http.post<SparePart>(this.url, dto);
  }
  update(id: number, dto: SparePartRequest): Observable<SparePart> {
    return this.http.put<SparePart>(`${this.url}/${id}`, dto);
  }
  addPartsToIntervention(interventionId: number, parts: any[]): Observable<any[]> {
    return this.http.post<any[]>(
      `${environment.apiUrl}/interventions/${interventionId}/parts`,
      { parts }
    );
  }
    // ── Historique de consommation ────────────────────────────
  getConsumptionHistory(type?: ConsumptionType): Observable<PartConsumption[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    return this.http.get<PartConsumption[]>(`${this.url}/consumption-history`, { params });
  }
}