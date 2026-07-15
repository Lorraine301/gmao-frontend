import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WeeklyReportService } from '../../services/weekly-report.service';
import { WeeklyReport } from '../../models/weekly-report.model';
import { downloadBlob } from '../../../../core/utils/download.util';

@Component({
  selector: 'app-weekly-report-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './weekly-report-detail.component.html',
  styleUrl: './weekly-report-detail.component.scss'
})
export class WeeklyReportDetailComponent implements OnInit {

  report?: WeeklyReport;
  isLoading = true;
  errorMessage = '';
  isDownloading = false;

  constructor(
    private route: ActivatedRoute,
    private weeklyReportService: WeeklyReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.weeklyReportService.findById(+id).subscribe({
        next: (r) => { this.report = r; this.isLoading = false; this.cdr.detectChanges(); },
        error: () => { this.errorMessage = 'Bilan introuvable.'; this.isLoading = false; this.cdr.detectChanges(); }
      });
    }
  }

  downloadPdf(): void {
    if (!this.report) return;
    this.isDownloading = true;
    this.weeklyReportService.downloadPdf(this.report.id).subscribe({
      next: (blob) => {
        downloadBlob(blob, `bilan_semaine_${this.report!.weekNumber}.pdf`);
        this.isDownloading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isDownloading = false;
        this.errorMessage = 'Erreur lors du téléchargement.';
        this.cdr.detectChanges();
      }
    });
  }
}