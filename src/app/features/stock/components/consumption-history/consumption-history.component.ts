import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SparePartService } from '../../services/spare-part.service';
import { PartConsumption, ConsumptionType } from '../../models/spare-part.model';
import { downloadBlob } from '../../../../core/utils/download.util';

type FilterOption = 'ALL' | ConsumptionType;

@Component({
  selector: 'app-consumption-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './consumption-history.component.html',
  styleUrl: './consumption-history.component.scss'
})
export class ConsumptionHistoryComponent implements OnInit {

  consumptions: PartConsumption[] = [];
  isLoading = false;
  errorMessage = '';
  activeFilter: FilterOption = 'ALL';
  showExportMenu = false;
  isExporting = false;

  constructor(
    private sparePartService: SparePartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    const typeParam = this.activeFilter === 'ALL' ? undefined : this.activeFilter;

    this.sparePartService.getConsumptionHistory(typeParam).subscribe({
      next: (data) => { this.consumptions = data; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.errorMessage = 'Erreur de chargement.'; this.cdr.detectChanges(); }
    });
  }

  setFilter(filter: FilterOption): void {
    if (this.activeFilter === filter) return;
    this.activeFilter = filter;
    this.loadHistory();
  }

  get totalCost(): number {
    return this.consumptions.reduce((sum, c) => sum + (c.totalPrice ?? 0), 0);
  }

  getTypeLabel(t: ConsumptionType): string {
    return t === 'CORRECTIVE' ? 'Intervention (panne)' : 'Maintenance préventive';
  }
  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  exportHistory(format: 'excel' | 'pdf'): void {
    this.showExportMenu = false;
    this.isExporting = true;

    const typeParam = this.activeFilter === 'ALL' ? undefined : this.activeFilter;

    this.sparePartService.exportConsumptionHistory(typeParam, format).subscribe({
      next: (blob) => {
        const extension = format === 'excel' ? 'xlsx' : 'pdf';
        downloadBlob(blob, `historique_consommation.${extension}`);
        this.isExporting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isExporting = false;
        this.errorMessage = 'Erreur lors de l\'export.';
        this.cdr.detectChanges();
      }
    });
   }
}