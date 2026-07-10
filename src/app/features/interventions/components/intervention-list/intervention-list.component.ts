import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InterventionService } from '../../services/intervention.service';
import { Intervention } from '../../models/intervention.model';

@Component({
  selector: 'app-intervention-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './intervention-list.component.html',
  styleUrl: './intervention-list.component.scss'
})
export class InterventionListComponent implements OnInit {

  allInterventions: Intervention[] = [];
  interventions: Intervention[] = [];
  isLoading = false;
  errorMessage = '';

  // ── Filtres ────────────────────────────────────────────────
  filterStatus = '';
  filterPriority = '';
  filterTechnician = '';
  filterEquipment = '';

  constructor(
    private interventionService: InterventionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.interventionService.findAll().subscribe({
      next: (data) => {
        this.allInterventions = [...data];
        this.interventions = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erreur de chargement des interventions.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Listes uniques pour les selects (dérivées des données) ──
  get technicianOptions(): string[] {
    return [...new Set(this.allInterventions.map(i => i.technicianName))].sort();
  }

  get equipmentOptions(): string[] {
    return [...new Set(this.allInterventions.map(i => i.equipmentCode))].sort();
  }

  applyFilters(): void {
    this.interventions = this.allInterventions.filter(i => {
      if (this.filterStatus && i.status !== this.filterStatus) return false;
      if (this.filterPriority && i.priority !== this.filterPriority) return false;
      if (this.filterTechnician && i.technicianName !== this.filterTechnician) return false;
      if (this.filterEquipment && i.equipmentCode !== this.filterEquipment) return false;
      return true;
    });
    this.cdr.detectChanges();
  }

  resetFilters(): void {
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterTechnician = '';
    this.filterEquipment = '';
    this.interventions = [...this.allInterventions];
    this.cdr.detectChanges();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filterStatus || this.filterPriority || this.filterTechnician || this.filterEquipment);
  }

  getPriorityLabel(p: string): string {
    return { Low: 'Faible', Medium: 'Moyen', High: 'Élevé', Critical: 'Critique' }[p] ?? p;
  }

  getStatusLabel(s: string): string {
    return { Pending: 'En attente', In_Progress: 'En cours', Completed: 'Terminée' }[s] ?? s;
  }

  getDurationLabel(d?: number): string {
    if (!d) return '—';
    return `${d}h`;
  }
}