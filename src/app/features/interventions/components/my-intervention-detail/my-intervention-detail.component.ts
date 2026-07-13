import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { InterventionService } from '../../services/intervention.service';
import { EquipmentService } from '../../../equipments/services/equipment.service';
import { SparePartService } from '../../../stock/services/spare-part.service';
import { Intervention } from '../../models/intervention.model';
import { Equipment } from '../../../equipments/models/equipment.model';
import { InterventionPart, SparePart } from '../../../stock/models/spare-part.model';

@Component({
  selector: 'app-my-intervention-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './my-intervention-detail.component.html',
  styleUrl: './my-intervention-detail.component.scss'
})
export class MyInterventionDetailComponent implements OnInit {

  intervention?: Intervention;
  equipment?: Equipment;
  spareParts: SparePart[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  completeForm!: FormGroup;
  isCompleting = false;
  showCompleteForm = false;
  partsUsed: InterventionPart[] = [];

  constructor(
    private route: ActivatedRoute,
    private interventionService: InterventionService,
    private equipmentService: EquipmentService,
    private sparePartService: SparePartService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.completeForm = this.fb.group({
      solution: ['', [Validators.required, Validators.minLength(10)]],
      parts: this.fb.array([])
    });
    this.loadSpareParts();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadIntervention(+id);
  }

  get partsArray(): FormArray {
    return this.completeForm.get('parts') as FormArray;
  }

  loadSpareParts(): void {
    this.sparePartService.findAll().subscribe({
      next: (data) => { this.spareParts = data; this.cdr.detectChanges(); }
    });
  }

// ── Remplace loadIntervention() ──
loadIntervention(id: number): void {
  this.isLoading = true;
  this.interventionService.findMy().subscribe({
    next: (activeList) => {
      const found = activeList.find(i => i.id === id);
      if (found) {
        this.setIntervention(found);
        return;
      }
      // Pas trouvé dans les actives → cherche dans les archives
      this.interventionService.findMyArchive().subscribe({
        next: (archiveList) => {
          const archived = archiveList.find(i => i.id === id);
          if (archived) {
            this.setIntervention(archived);
          } else {
            this.errorMessage = 'Intervention introuvable ou non assignée.';
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.errorMessage = 'Erreur de chargement.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    },
    error: () => {
      this.errorMessage = 'Erreur de chargement.';
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

private setIntervention(intervention: Intervention): void {
  this.intervention = intervention;
  this.loadEquipment(intervention.failureId);
  this.sparePartService.getInterventionParts(intervention.id).subscribe({
    next: (parts) => { this.partsUsed = parts; this.cdr.detectChanges(); }
  });
}

  loadEquipment(failureId: number): void {
    this.equipmentService.findAll().subscribe({
      next: (equipments) => {
        this.equipment = equipments.find(
          e => e.code === this.intervention?.equipmentCode
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startIntervention(): void {
    if (!this.intervention) return;
    this.interventionService.updateStatus(this.intervention.id, 'In_Progress').subscribe({
      next: (updated) => {
        this.intervention = updated;
        this.successMessage = 'Intervention démarrée.';
        this.cdr.detectChanges();
      }
    });
  }

  openCompleteForm(): void { this.showCompleteForm = true; this.cdr.detectChanges(); }

  // ── Gestion des lignes de pièces ──────────────────────────
  addPartRow(): void {
    this.partsArray.push(this.fb.group({
      sparePartId: [null, Validators.required],
      quantityUsed: [1, [Validators.required, Validators.min(1)]]
    }));
    this.cdr.detectChanges();
  }

  removePartRow(index: number): void {
    this.partsArray.removeAt(index);
    this.cdr.detectChanges();
  }

  submitComplete(): void {
    if (this.completeForm.get('solution')?.invalid || !this.intervention) {
      this.completeForm.markAllAsTouched();
      return;
    }
    this.isCompleting = true;

    const solution = this.completeForm.get('solution')!.value;

    const parts = this.partsArray.controls
      .filter(c => c.get('sparePartId')?.value)
      .map(c => ({
        sparePartId: c.get('sparePartId')!.value,
        quantityUsed: c.get('quantityUsed')!.value
      }));

    this.interventionService.complete(this.intervention.id, solution, parts).subscribe({
      next: (updated) => {
        this.intervention = updated;
        this.isCompleting = false;
        this.showCompleteForm = false;
        this.successMessage = 'Intervention clôturée avec succès.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isCompleting = false;
        this.errorMessage = err.error?.error ?? 'Erreur lors de la clôture.';
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