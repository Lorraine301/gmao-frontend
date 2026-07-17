import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FailureService } from '../../services/failure.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Failure } from '../../models/failure.model';
import { AiAnalysis } from '../../models/ai-analysis.model';

@Component({
  selector: 'app-failure-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './failure-detail.component.html',
  styleUrl: './failure-detail.component.scss'
})
export class FailureDetailComponent implements OnInit {

  failure?: Failure;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  isClosing = false;

  // ── Analyse IA ────────────────────────────────────────────
  aiAnalysis?: AiAnalysis;
  isLoadingAnalysis = false;
  isRetrying = false;

  constructor(
    private route: ActivatedRoute,
    private failureService: FailureService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFailure(+id);
    }
  }

  loadFailure(id: number): void {
    this.failureService.findById(id).subscribe({
      next: (f) => {
        this.failure = f;
        this.isLoading = false;
        this.loadAnalysis(id);
        this.cdr.detectChanges();
      },
      error: () => { this.errorMessage = 'Panne introuvable.'; this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  // ── Charge l'analyse IA (peut ne pas encore exister → 404 silencieux) ──
  loadAnalysis(failureId: number): void {
    this.isLoadingAnalysis = true;
    this.failureService.getAnalysis(failureId).subscribe({
      next: (analysis) => {
        this.aiAnalysis = analysis;
        this.isLoadingAnalysis = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // 404 = analyse pas encore générée (asynchrone en cours) : normal, pas une erreur à afficher
        this.aiAnalysis = undefined;
        this.isLoadingAnalysis = false;
        this.cdr.detectChanges();
      }
    });
  }

  retryAnalysis(): void {
    if (!this.failure) return;
    this.isRetrying = true;
    this.failureService.retryAnalysis(this.failure.id).subscribe({
      next: () => {
        // La relance est asynchrone côté backend : on attend un peu puis on recharge
        setTimeout(() => {
          this.loadAnalysis(this.failure!.id);
          this.isRetrying = false;
          this.cdr.detectChanges();
        }, 4000);
      },
      error: () => {
        this.isRetrying = false;
        this.errorMessage = 'Erreur lors de la relance de l\'analyse.';
        this.cdr.detectChanges();
      }
    });
  }

  get role(): string { return this.authService.getRole() ?? ''; }
  get isSupervisorOrAdmin(): boolean { return ['Admin', 'Supervisor'].includes(this.role); }

  closeFailure(): void {
    if (!this.failure) return;
    this.isClosing = true;
    this.errorMessage = '';

    this.failureService.close(this.failure.id).subscribe({
      next: (updated) => {
        this.failure = updated;
        this.isClosing = false;
        this.successMessage = 'Panne clôturée définitivement.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isClosing = false;
        this.errorMessage = err.error?.error ?? 'Erreur lors de la clôture.';
        this.cdr.detectChanges();
      }
    });
  }

  getPriorityLabel(p: string): string {
    return { Low: 'Faible', Medium: 'Moyen', High: 'Élevé', Critical: 'Critique' }[p] ?? p;
  }
  getStatusLabel(s: string): string {
    return { Open: 'Ouverte', In_Progress: 'En cours', Resolved: 'Résolue', Closed: 'Clôturée' }[s] ?? s;
  }
  getFailureTypeLabel(t?: string): string {
    if (!t) return '—';
    return { Mechanical: 'Mécanique', Electrical: 'Électrique', Other: 'Autre' }[t] ?? t;
  }
}