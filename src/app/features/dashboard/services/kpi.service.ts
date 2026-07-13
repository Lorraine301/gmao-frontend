import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  KpiSummary, EquipmentFailureCount, StatusCount, PriorityCount,
  TechnicianWorkload, MonthlyTrend, MttrResponse, AvailabilityResponse
} from '../models/kpi.model';
import { AtRiskEquipment } from '../../interventions/models/intervention.model';

@Injectable({ providedIn: 'root' })
export class KpiService {
  private readonly url = `${environment.apiUrl}/kpi`;

  constructor(private http: HttpClient) {}

  private periodParams(period: number): HttpParams {
    return new HttpParams().set('period', period.toString());
  }

  getSummary(period: number): Observable<KpiSummary> {
    return this.http.get<KpiSummary>(`${this.url}/summary`, { params: this.periodParams(period) });
  }

  getFailuresByEquipment(period: number): Observable<EquipmentFailureCount[]> {
    return this.http.get<EquipmentFailureCount[]>(`${this.url}/failures-by-equipment`, { params: this.periodParams(period) });
  }

  getFailuresByStatus(period: number): Observable<StatusCount[]> {
    return this.http.get<StatusCount[]>(`${this.url}/failures-by-status`, { params: this.periodParams(period) });
  }

  getFailuresByPriority(period: number): Observable<PriorityCount[]> {
    return this.http.get<PriorityCount[]>(`${this.url}/failures-by-priority`, { params: this.periodParams(period) });
  }

  getMttr(period: number): Observable<MttrResponse> {
    return this.http.get<MttrResponse>(`${this.url}/mttr`, { params: this.periodParams(period) });
  }

  getAvailability(period: number): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(`${this.url}/availability`, { params: this.periodParams(period) });
  }

  getMonthlyTrends(months: number = 6): Observable<MonthlyTrend[]> {
    return this.http.get<MonthlyTrend[]>(`${this.url}/monthly-trends`, { params: new HttpParams().set('months', months.toString()) });
  }

  getTechnicianWorkload(period: number): Observable<TechnicianWorkload[]> {
    return this.http.get<TechnicianWorkload[]>(`${this.url}/technician-workload`, { params: this.periodParams(period) });
  }

  getAtRiskEquipments(): Observable<AtRiskEquipment[]> {
    return this.http.get<AtRiskEquipment[]>(`${environment.apiUrl}/equipments/at-risk`);
  }
}