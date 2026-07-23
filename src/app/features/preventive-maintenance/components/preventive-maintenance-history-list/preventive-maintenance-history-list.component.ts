import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PreventiveMaintenanceService } from '../../services/preventive-maintenance.service';
import { EquipmentService } from '../../../equipments/services/equipment.service';
import { PreventiveMaintenanceHistory } from '../../models/preventive-maintenance-history.model';
import { Equipment } from '../../../equipments/models/equipment.model';
import { SparePartService } from '../../../stock/services/spare-part.service';
import { PreventiveMaintenancePart } from '../../../stock/models/spare-part.model';

@Component({
  selector: 'app-preventive-maintenance-history-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './preventive-maintenance-history-list.component.html',
  styleUrl: './preventive-maintenance-history-list.component.scss'
})
export class PreventiveMaintenanceHistoryListComponent implements OnInit {

  history: PreventiveMaintenanceHistory[] = [];
  equipments: Equipment[] = [];
  isLoading = false;
  errorMessage = '';
  selectedEquipmentId: number | null = null;
  detailHistory: PreventiveMaintenanceHistory | null = null;
  detailParts: PreventiveMaintenancePart[] = [];
  isLoadingParts = false;

  constructor(
    private pmService: PreventiveMaintenanceService,
    private equipmentService: EquipmentService,
    private sparePartService: SparePartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.equipmentService.findAll().subscribe({
      next: (data) => { this.equipments = data; this.cdr.detectChanges(); }
    });
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.pmService.findHistory(this.selectedEquipmentId ?? undefined).subscribe({
      next: (data) => { this.history = data; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.errorMessage = 'Erreur de chargement.'; this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  onEquipmentFilterChange(): void {
    this.loadHistory();
  }

  resetFilter(): void {
    this.selectedEquipmentId = null;
    this.loadHistory();
  }
  openDetail(h: PreventiveMaintenanceHistory): void {
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

  closeDetail(): void {
    this.detailHistory = null;
    this.cdr.detectChanges();
  }
}