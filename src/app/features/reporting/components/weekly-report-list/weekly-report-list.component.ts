import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WeeklyReportService } from '../../services/weekly-report.service';
import { AuthService } from '../../../../core/services/auth.service';
import { WeeklyReport } from '../../models/weekly-report.model';
import { downloadBlob } from '../../../../core/utils/download.util';

@Component({
  selector: 'app-weekly-report-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './weekly-report-list.component.html',
  styleUrl: './weekly-report-list.component.scss'
})
export class WeeklyReportListComponent implements OnInit {

  reports: WeeklyReport[] = [];
  isLoading = false;
  errorMessage = '';

  // ── Bilan mensuel ────────────────────────────────────────
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  isGeneratingMonthly = false;

  readonly months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ];

  constructor(
    private weeklyReportService: WeeklyReportService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  get isSupervisorOrAdmin(): boolean {
    return ['Admin', 'Supervisor'].includes(this.authService.getRole() ?? '');
  }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.weeklyReportService.findAll().subscribe({
      next: (data) => { this.reports = data; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.errorMessage = 'Erreur de chargement.'; this.cdr.detectChanges(); }
    });
  }

  downloadPdf(report: WeeklyReport, event: Event): void {
    event.stopPropagation();
    this.weeklyReportService.downloadPdf(report.id).subscribe({
      next: (blob) => downloadBlob(blob, `bilan_semaine_${report.weekNumber}.pdf`),
      error: () => { this.errorMessage = 'Erreur lors du téléchargement.'; this.cdr.detectChanges(); }
    });
  }

  generateMonthlyPdf(): void {
    this.isGeneratingMonthly = true;
    this.weeklyReportService.downloadMonthlyPdf(this.selectedMonth, this.selectedYear).subscribe({
      next: (blob) => {
        downloadBlob(blob, `bilan_mensuel_${this.selectedYear}_${this.selectedMonth}.pdf`);
        this.isGeneratingMonthly = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isGeneratingMonthly = false;
        this.errorMessage = 'Erreur lors de la génération du bilan mensuel.';
        this.cdr.detectChanges();
      }
    });
  }

  getLlmStatusLabel(report: WeeklyReport): string {
    return report.llmSummary ? 'Analysé' : 'En attente';
  }
}