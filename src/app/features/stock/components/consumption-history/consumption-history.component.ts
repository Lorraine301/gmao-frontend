import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SparePartService } from '../../services/spare-part.service';
import { PartConsumption, ConsumptionType } from '../../models/spare-part.model';

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
}