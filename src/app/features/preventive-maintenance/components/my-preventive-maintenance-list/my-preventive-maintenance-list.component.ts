import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PreventiveMaintenanceService } from '../../services/preventive-maintenance.service';
import { PreventiveMaintenance } from '../../models/preventive-maintenance.model';

@Component({
  selector: 'app-my-preventive-maintenance-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-preventive-maintenance-list.component.html',
  styleUrl: './my-preventive-maintenance-list.component.scss'
})
export class MyPreventiveMaintenanceListComponent implements OnInit {

  maintenances: PreventiveMaintenance[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private pmService: PreventiveMaintenanceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMaintenances();
  }

  loadMaintenances(): void {
    this.isLoading = true;
    this.pmService.findMy().subscribe({
      next: (data) => { this.maintenances = [...data]; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.errorMessage = 'Erreur de chargement.'; this.cdr.detectChanges(); }
    });
  }

  getExecutionStatusLabel(s?: string): string {
    return { Pending: 'À faire', In_Progress: 'En cours', Completed: 'Terminée' }[s ?? ''] ?? '—';
  }
}