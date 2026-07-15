import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WeeklyReport } from '../models/weekly-report.model';

@Injectable({ providedIn: 'root' })
export class WeeklyReportService {
  private readonly url = `${environment.apiUrl}/weekly-reports`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<WeeklyReport[]> {
    return this.http.get<WeeklyReport[]>(this.url);
  }

  findById(id: number): Observable<WeeklyReport> {
    return this.http.get<WeeklyReport>(`${this.url}/${id}`);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/pdf`, { responseType: 'blob' });
  }

  downloadMonthlyPdf(month: number, year: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/reports/monthly`, {
      params: { month: month.toString(), year: year.toString() },
      responseType: 'blob'
    });
  }
}