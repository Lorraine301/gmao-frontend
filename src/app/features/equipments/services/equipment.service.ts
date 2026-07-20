import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Equipment, EquipmentFilters, EquipmentImportResult, EquipmentRequest } from '../models/equipment.model';

@Injectable({ providedIn: 'root' })
export class EquipmentService {

  private readonly url = `${environment.apiUrl}/equipments`;

  constructor(private http: HttpClient) {}

  findAll(filters?: EquipmentFilters): Observable<Equipment[]> {
    let params = new HttpParams();
    if (filters?.status)      params = params.set('status', filters.status);
    if (filters?.type)        params = params.set('type', filters.type);
    if (filters?.criticality) params = params.set('criticality', filters.criticality);
    if (filters?.search)      params = params.set('search', filters.search);
    return this.http.get<Equipment[]>(this.url, { params });
  }

  findById(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.url}/${id}`);
  }

  create(dto: EquipmentRequest): Observable<Equipment> {
    return this.http.post<Equipment>(this.url, dto);
  }

  update(id: number, dto: EquipmentRequest): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.url}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
  exportEquipments(format: 'excel' | 'json'): Observable<Blob> {
  return this.http.get(`${this.url}/export`, {
    params: { format },
    responseType: 'blob'
  });
  }
// ── Import ──────────────────────────────────────────────
  importEquipments(file: File): Observable<EquipmentImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<EquipmentImportResult>(`${this.url}/import`, formData);
  }
}