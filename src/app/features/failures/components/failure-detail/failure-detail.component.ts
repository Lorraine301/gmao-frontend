import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FailureService } from '../../services/failure.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Failure } from '../../models/failure.model';

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
      next: (f) => { this.failure = f; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.errorMessage = 'Panne introuvable.'; this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  get role(): string { return this.authService.getRole() ?? ''; }
  get isSupervisorOrAdmin(): boolean { return ['Admin', 'Supervisor'].includes(this.role); }

  // ── Clôture définitive (Admin/Supervisor, uniquement si Resolved) ──
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