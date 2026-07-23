import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { InterventionService } from '../../services/intervention.service';
import { EquipmentService } from '../../../equipments/services/equipment.service';
import { Intervention } from '../../models/intervention.model';
import { Equipment } from '../../../equipments/models/equipment.model';
import { downloadBlob } from '../../../../core/utils/download.util';
import { SparePartService } from '../../../stock/services/spare-part.service';
import { InterventionPart } from '../../../stock/models/spare-part.model';

@Component({
  selector: 'app-intervention-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './intervention-detail.component.html',
  styleUrl: './intervention-detail.component.scss'
})
export class InterventionDetailComponent implements OnInit {

  intervention?: Intervention;
  equipment?: Equipment;
  isLoading = true;
  errorMessage = '';
  isDownloadingPdf = false;
  partsUsed: InterventionPart[] = [];
  isLoadingParts = false;

  constructor(
    private route: ActivatedRoute,
    private interventionService: InterventionService,
    private equipmentService: EquipmentService,
    private sparePartService: SparePartService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.interventionService.findAll().subscribe({
        next: (list) => {
          this.intervention = list.find(i => i.id === +id!);
          if (!this.intervention) {
            this.errorMessage = 'Intervention introuvable.';
            this.isLoading = false;
            this.cdr.detectChanges();
            return;
          }
          this.equipmentService.findAll().subscribe({
            next: (equipments) => {
              this.equipment = equipments.find(e => e.code === this.intervention?.equipmentCode);
              this.isLoading = false;
              this.loadParts(this.intervention!.id);
              this.cdr.detectChanges();
            },
            error: () => { this.isLoading = false; this.cdr.detectChanges(); }
          });
        },
        error: () => {
          this.errorMessage = 'Erreur de chargement.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
  downloadPdf(): void {
  if (!this.intervention) return;
  this.isDownloadingPdf = true;
  this.interventionService.downloadPdf(this.intervention.id).subscribe({
    next: (blob) => {
      downloadBlob(blob, `intervention_${this.intervention!.id}.pdf`);
      this.isDownloadingPdf = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.isDownloadingPdf = false;
      this.errorMessage = 'Erreur lors du téléchargement du PDF.';
      this.cdr.detectChanges();
    }
  });
}

loadParts(interventionId: number): void {
    this.isLoadingParts = true;
    this.sparePartService.getInterventionParts(interventionId).subscribe({
      next: (parts) => {
        this.partsUsed = parts;
        this.isLoadingParts = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingParts = false;
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
  getCriticalityLabel(c?: string): string {
    if (!c) return '—';
    return { Low: 'Faible', Medium: 'Moyen', High: 'Élevé' }[c] ?? c;
  }
}