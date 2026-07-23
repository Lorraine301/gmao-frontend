import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpParams } from '@angular/common/http';
import {
  PreventiveMaintenance,
  PreventiveMaintenanceRequest,
  AssignTechnicianRequest,
  CompletePreventiveMaintenanceRequest
} from '../models/preventive-maintenance.model';
import { PreventiveMaintenanceHistory} from '../models/preventive-maintenance-history.model';

@Injectable({ providedIn: 'root' })
export class PreventiveMaintenanceService {
  private readonly url = `${environment.apiUrl}/preventive-maintenances`;
  constructor(private http: HttpClient) {}

  findAll(): Observable<PreventiveMaintenance[]> {
    return this.http.get<PreventiveMaintenance[]>(this.url);
  }
  findOverdue(): Observable<PreventiveMaintenance[]> {
    return this.http.get<PreventiveMaintenance[]>(`${this.url}/overdue`);
  }
  schedule(dto: PreventiveMaintenanceRequest): Observable<PreventiveMaintenance> {
    return this.http.post<PreventiveMaintenance>(this.url, dto);
  }
  complete(id: number): Observable<PreventiveMaintenance> {
    return this.http.put<PreventiveMaintenance>(`${this.url}/${id}/complete`, {});
  }

  // ── Affecter un technicien (Admin/Supervisor) ─────────────
  assignTechnician(id: number, technicianId: number): Observable<PreventiveMaintenance> {
    const dto: AssignTechnicianRequest = { technicianId };
    return this.http.put<PreventiveMaintenance>(`${this.url}/${id}/assign`, dto);
  }

  // ── Mes maintenances (technicien connecté) ────────────────
  findMy(): Observable<PreventiveMaintenance[]> {
    return this.http.get<PreventiveMaintenance[]>(`${this.url}/my`);
  }

  // ── Démarrer (technicien) ─────────────────────────────────
  startExecution(id: number): Observable<PreventiveMaintenance> {
    return this.http.put<PreventiveMaintenance>(`${this.url}/${id}/start`, {});
  }

  // ── Clôturer (technicien) : problème/solution/pièces optionnels ──
  completeByTechnician(
    id: number,
    dto: CompletePreventiveMaintenanceRequest
  ): Observable<PreventiveMaintenance> {
    return this.http.put<PreventiveMaintenance>(`${this.url}/${id}/complete-technician`, dto);
  }
  // ── Mes maintenances archivées (technicien connecté) ────────────────
  findMyArchive(): Observable<PreventiveMaintenanceHistory[]> {
  return this.http.get<PreventiveMaintenanceHistory[]>(`${this.url}/my/archive`);
 }

 findHistory(equipmentId?: number): Observable<PreventiveMaintenanceHistory[]> {
  let params = new HttpParams();
  if (equipmentId) params = params.set('equipmentId', equipmentId.toString());
  return this.http.get<PreventiveMaintenanceHistory[]>(`${this.url}/history`, { params });
 }

}