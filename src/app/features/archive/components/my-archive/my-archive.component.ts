import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InterventionService } from '../../../interventions/services/intervention.service';
import { PreventiveMaintenanceService } from '../../../preventive-maintenance/services/preventive-maintenance.service';
import { Intervention } from '../../../interventions/models/intervention.model';
import { PreventiveMaintenanceHistory } from '../../../preventive-maintenance/models/preventive-maintenance-history.model';
import { SparePartService } from '../../../stock/services/spare-part.service';
import { PreventiveMaintenancePart } from '../../../stock/models/spare-part.model';

@Component({
  selector: 'app-my-archive',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-archive.component.html',
  styleUrl: './my-archive.component.scss'
})
export class MyArchiveComponent implements OnInit {

  interventions: Intervention[] = [];
  maintenances: PreventiveMaintenanceHistory[] = [];
  isLoading = false;
  errorMessage = '';
  activeTab: 'interventions' | 'maintenances' = 'interventions';
  detailHistory: PreventiveMaintenanceHistory | null = null;
  detailParts: PreventiveMaintenancePart[] = [];
  isLoadingParts = false;

  constructor(
    private interventionService: InterventionService,
    private pmService: PreventiveMaintenanceService,
    private sparePartService: SparePartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;
    this.interventionService.findMyArchive().subscribe({
      next: (data) => { this.interventions = [...data]; this.cdr.detectChanges(); }
    });
    this.pmService.findMyArchive().subscribe({
      next: (data) => {
        this.maintenances = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.errorMessage = 'Erreur de chargement.'; this.cdr.detectChanges(); }
    });
  }

  setTab(tab: 'interventions' | 'maintenances'): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  getPriorityLabel(p: string): string {
    return { Low: 'Faible', Medium: 'Moyen', High: 'Élevé', Critical: 'Critique' }[p] ?? p;
  }
  openMaintenanceDetail(h: PreventiveMaintenanceHistory): void {
    this.detailHistory = h;
    this.detailParts = [];
    this.isLoadingParts = true;
    this.cdr.detectChanges();

    this.sparePartService.getPartsByHistory(h.id).subscribe({
      next: (parts) => {
        this.detailParts = parts;
        this.isLoadingParts = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingParts = false;
        this.cdr.detectChanges();
      }
    });
   }

  closeMaintenanceDetail(): void {
    this.detailHistory = null;
    this.cdr.detectChanges();
   }
}