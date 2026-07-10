import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { PreventiveMaintenanceService } from '../../services/preventive-maintenance.service';
import { SparePartService } from '../../../stock/services/spare-part.service';
import { PreventiveMaintenance } from '../../models/preventive-maintenance.model';
import { SparePart } from '../../../stock/models/spare-part.model';

@Component({
  selector: 'app-my-preventive-maintenance-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './my-preventive-maintenance-detail.component.html',
  styleUrl: './my-preventive-maintenance-detail.component.scss'
})
export class MyPreventiveMaintenanceDetailComponent implements OnInit {

  maintenance?: PreventiveMaintenance;
  spareParts: SparePart[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  completeForm!: FormGroup;
  isCompleting = false;
  showCompleteForm = false;

  constructor(
    private route: ActivatedRoute,
    private pmService: PreventiveMaintenanceService,
    private sparePartService: SparePartService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ── Tous les champs sont optionnels : aucun Validators.required ──
    this.completeForm = this.fb.group({
      problemFound: [''],
      solution: [''],
      parts: this.fb.array([])
    });
    this.loadSpareParts();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadMaintenance(+id);
  }

  get partsArray(): FormArray {
    return this.completeForm.get('parts') as FormArray;
  }

  loadSpareParts(): void {
    this.sparePartService.findAll().subscribe({
      next: (data) => { this.spareParts = data; this.cdr.detectChanges(); }
    });
  }

  loadMaintenance(id: number): void {
    this.isLoading = true;
    this.pmService.findMy().subscribe({
      next: (list) => {
        this.maintenance = list.find(pm => pm.id === id);
        if (!this.maintenance) {
          this.errorMessage = 'Maintenance introuvable ou non assignée.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erreur de chargement.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startExecution(): void {
    if (!this.maintenance) return;
    this.pmService.startExecution(this.maintenance.id).subscribe({
      next: (updated) => {
        this.maintenance = updated;
        this.successMessage = 'Maintenance démarrée.';
        this.cdr.detectChanges();
      }
    });
  }

  openCompleteForm(): void { this.showCompleteForm = true; this.cdr.detectChanges(); }

  addPartRow(): void {
    this.partsArray.push(this.fb.group({
      sparePartId: [null],
      quantityUsed: [1]
    }));
    this.cdr.detectChanges();
  }

  removePartRow(index: number): void {
    this.partsArray.removeAt(index);
    this.cdr.detectChanges();
  }

  submitComplete(): void {
    if (!this.maintenance) return;
    this.isCompleting = true;

    const problemFound = this.completeForm.get('problemFound')!.value?.trim() || null;
    const solution = this.completeForm.get('solution')!.value?.trim() || null;

    const parts = this.partsArray.controls
      .filter(c => c.get('sparePartId')?.value)
      .map(c => ({
        sparePartId: c.get('sparePartId')!.value,
        quantityUsed: c.get('quantityUsed')!.value
      }));

    this.pmService.completeByTechnician(this.maintenance.id, {
      problemFound,
      solution,
      parts
    }).subscribe({
      next: (updated) => {
        this.maintenance = updated;
        this.isCompleting = false;
        this.showCompleteForm = false;
        this.successMessage = 'Maintenance clôturée avec succès.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isCompleting = false;
        this.errorMessage = err.error?.error ?? 'Erreur lors de la clôture.';
        this.cdr.detectChanges();
      }
    });
  }

  getExecutionStatusLabel(s?: string): string {
    return { Pending: 'À faire', In_Progress: 'En cours', Completed: 'Terminée' }[s ?? ''] ?? '—';
  }
}