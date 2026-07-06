import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InterventionService } from '../../services/intervention.service';
import { Intervention } from '../../models/intervention.model';

@Component({
  selector: 'app-intervention-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './intervention-list.component.html',
  styleUrl: './intervention-list.component.scss'
})
export class InterventionListComponent implements OnInit {

  interventions: Intervention[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private interventionService: InterventionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.interventionService.findAll().subscribe({
      next: (data) => {
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