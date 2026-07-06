import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FailureService } from '../../services/failure.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Failure, FailureFilters, FailurePriority, FailureStatus } from '../../models/failure.model';
import { InterventionService } from '../../../interventions/services/intervention.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-failure-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './failure-list.component.html',
  styleUrl: './failure-list.component.scss'
})
export class FailureListComponent implements OnInit {

  failures: Failure[] = [];
  technicians: any[] = [];
  isLoading = false;
  errorMessage = '';

  // Affectation
  assignFailureId: number | null = null;
  selectedTechnicianId: number | null = null;
  isAssigning = false;

  filters: FailureFilters = {};
  statusOptions: FailureStatus[] = ['Open', 'In_Progress', 'Resolved', 'Closed'];
  priorityOptions: FailurePriority[] = ['Low', 'Medium', 'High', 'Critical'];
  failureTypeOptions = ['Mechanical', 'Electrical', 'Other'];

  constructor(
    private failureService: FailureService,
    private interventionService: InterventionService,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFailures();
    if (this.isSupervisorOrAdmin) {
      this.loadTechnicians();
    }
  }

  get role(): string { return this.authService.getRole() ?? ''; }
  get isAdmin(): boolean { return this.role === 'Admin'; }
  get isSupervisorOrAdmin(): boolean { return ['Admin', 'Supervisor'].includes(this.role); }
  get isTechnician(): boolean { return this.role === 'Technician'; }

  loadFailures(): void {
    this.isLoading = true;
    const activeFilters: FailureFilters = {};
    if (this.filters.status)   activeFilters.status = this.filters.status;
    if (this.filters.priority) activeFilters.priority = this.filters.priority;

    this.failureService.findAll(activeFilters).subscribe({
      next: (data) => { this.failures = [...data]; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.errorMessage = 'Erreur de chargement.'; this.cdr.detectChanges(); }
    });
  }

  loadTechnicians(): void {
    this.userService.getTechnicians().subscribe({
      next: (data) => { this.technicians = data; this.cdr.detectChanges(); }
    });
  }

  onFilterChange(): void { this.loadFailures(); }

  resetFilters(): void { this.filters = {}; this.loadFailures(); }

  openAssignPanel(failureId: number): void {
    this.assignFailureId = failureId;
    this.selectedTechnicianId = null;
    this.cdr.detectChanges();
  }

  cancelAssign(): void {
    this.assignFailureId = null;
    this.selectedTechnicianId = null;
    this.cdr.detectChanges();
  }

  confirmAssign(): void {
    if (!this.assignFailureId || !this.selectedTechnicianId) return;
    this.isAssigning = true;
    this.interventionService.create(this.assignFailureId, this.selectedTechnicianId).subscribe({
      next: () => {
        this.isAssigning = false;
        this.assignFailureId = null;
        this.selectedTechnicianId = null;
        this.loadFailures();
      },
      error: (err) => {
        this.isAssigning = false;
        this.errorMessage = err.status === 400 ? 'Données invalides.' : 'Erreur lors de l\'affectation.';
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
  getFailureTypeLabel(t: string): string {
    return { Mechanical: 'Mécanique', Electrical: 'Électrique', Other: 'Autre' }[t] ?? t;
  }
}