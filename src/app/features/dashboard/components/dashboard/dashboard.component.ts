import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { KpiService } from '../../services/kpi.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  KpiSummary, EquipmentFailureCount, StatusCount, PriorityCount,
  TechnicianWorkload, MonthlyTrend
} from '../../models/kpi.model';
import { AtRiskEquipment } from '../../../interventions/models/intervention.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('equipmentChart') equipmentChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('priorityChart') priorityChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendsChart') trendsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('workloadChart') workloadChartRef!: ElementRef<HTMLCanvasElement>;

  private equipmentChart?: Chart;
  private statusChart?: Chart;
  private priorityChart?: Chart;
  private trendsChart?: Chart;
  private workloadChart?: Chart;

  summary: KpiSummary | null = null;
  availabilityRate: number | null = null;
  atRiskEquipments: AtRiskEquipment[] = [];

  selectedPeriod = 30;
  isLoading = false;
  errorMessage = '';
  viewReady = false;

  readonly periodOptions = [
    { label: '7 jours', value: 7 },
    { label: '30 jours', value: 30 },
    { label: '90 jours', value: 90 }
  ];

  constructor(
    private kpiService: KpiService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  get userRole(): string | null {
    return this.authService.getRole();
  }

  ngOnInit(): void {
    this.loadAtRiskEquipments();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.equipmentChart?.destroy();
    this.statusChart?.destroy();
    this.priorityChart?.destroy();
    this.trendsChart?.destroy();
    this.workloadChart?.destroy();
  }

  onPeriodChange(period: number): void {
    this.selectedPeriod = period;
    this.loadAll();
  }

  loadAtRiskEquipments(): void {
    this.kpiService.getAtRiskEquipments().subscribe({
      next: (data) => { this.atRiskEquipments = data; this.cdr.detectChanges(); }
    });
  }

  loadAll(): void {
    if (!this.viewReady) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.kpiService.getSummary(this.selectedPeriod).subscribe({
      next: (data) => { this.summary = data; this.cdr.detectChanges(); },
      error: () => { this.errorMessage = 'Erreur de chargement des KPI.'; }
    });

    this.kpiService.getAvailability(this.selectedPeriod).subscribe({
      next: (data) => { this.availabilityRate = data.availabilityRate; this.cdr.detectChanges(); }
    });

    this.kpiService.getFailuresByEquipment(this.selectedPeriod).subscribe({
      next: (data) => this.renderEquipmentChart(data.slice(0, 5))
    });

    this.kpiService.getFailuresByStatus(this.selectedPeriod).subscribe({
      next: (data) => this.renderStatusChart(data)
    });

    this.kpiService.getFailuresByPriority(this.selectedPeriod).subscribe({
      next: (data) => this.renderPriorityChart(data)
    });

    this.kpiService.getMonthlyTrends(6).subscribe({
      next: (data) => this.renderTrendsChart(data)
    });

    this.kpiService.getTechnicianWorkload(this.selectedPeriod).subscribe({
      next: (data) => {
        this.renderWorkloadChart(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  // ── Graphique 1 : Barres – pannes par équipement (top 5) ──
  private renderEquipmentChart(data: EquipmentFailureCount[]): void {
    this.equipmentChart?.destroy();
    this.equipmentChart = new Chart(this.equipmentChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(d => d.equipmentCode),
        datasets: [{
          label: 'Nombre de pannes',
          data: data.map(d => d.failureCount),
          backgroundColor: '#2E75B6'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }

  // ── Graphique 2 : Donut – pannes par statut ──
  private renderStatusChart(data: StatusCount[]): void {
    this.statusChart?.destroy();
    const colors: Record<string, string> = {
      Open: '#1565c0', In_Progress: '#e65100', Resolved: '#2e7d32', Closed: '#616161'
    };
    this.statusChart = new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.status),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: data.map(d => colors[d.status] ?? '#90a4ae')
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // ── Graphique 3 : Donut – pannes par priorité ──
  private renderPriorityChart(data: PriorityCount[]): void {
    this.priorityChart?.destroy();
    const colors: Record<string, string> = {
      Low: '#616161', Medium: '#f57f17', High: '#e65100', Critical: '#c62828'
    };
    this.priorityChart = new Chart(this.priorityChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.priority),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: data.map(d => colors[d.priority] ?? '#90a4ae')
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // ── Graphique 4 : Ligne – évolution mensuelle (6 mois) ──
  private renderTrendsChart(data: MonthlyTrend[]): void {
    this.trendsChart?.destroy();
    this.trendsChart = new Chart(this.trendsChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.map(d => d.month),
        datasets: [
          {
            label: 'Pannes',
            data: data.map(d => d.failureCount),
            borderColor: '#c0392b',
            backgroundColor: 'rgba(192,57,43,0.1)',
            tension: 0.3
          },
          {
            label: 'Interventions',
            data: data.map(d => d.interventionCount),
            borderColor: '#2E75B6',
            backgroundColor: 'rgba(46,117,182,0.1)',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }

  // ── Graphique 5 : Barres horizontales – charge de travail technicien ──
  private renderWorkloadChart(data: TechnicianWorkload[]): void {
    this.workloadChart?.destroy();
    this.workloadChart = new Chart(this.workloadChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(d => d.technicianName),
        datasets: [{
          label: 'Interventions',
          data: data.map(d => d.interventionCount),
          backgroundColor: '#1E3A5F'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }
}