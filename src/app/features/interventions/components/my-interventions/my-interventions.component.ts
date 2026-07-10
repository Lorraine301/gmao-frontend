import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InterventionService } from '../../services/intervention.service';
import { SparePartService } from '../../../stock/services/spare-part.service';
import { Intervention } from '../../models/intervention.model';
import { SparePart } from '../../../stock/models/spare-part.model';

@Component({
  selector: 'app-my-interventions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './my-interventions.component.html',
  styleUrl: './my-interventions.component.scss'
})
export class MyInterventionsComponent implements OnInit {

  interventions: Intervention[] = [];
  spareParts: SparePart[] = [];
  isLoading = false;
  errorMessage = '';

  completeInterventionId: number | null = null;
  solutionForm!: FormGroup;
  isCompleting = false;

  constructor(
    private interventionService: InterventionService,
    private sparePartService: SparePartService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.solutionForm = this.fb.group({
      solution: ['', [Validators.required, Validators.minLength(10)]],
      parts: this.fb.array([])
    });
    this.loadInterventions();
    this.loadSpareParts();
  }

  get partsArray(): FormArray {
    return this.solutionForm.get('parts') as FormArray;
  }

  loadInterventions(): void {
    this.isLoading = true;
    this.interventionService.findMy().subscribe({
      next: (data) => { this.interventions = [...data]; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.errorMessage = 'Erreur de chargement.'; this.cdr.detectChanges(); }
    });
  }

  loadSpareParts(): void {
    this.sparePartService.findAll().subscribe({
      next: (data) => { this.spareParts = data; this.cdr.detectChanges(); }
    });
  }

  startIntervention(id: number): void {
    this.interventionService.updateStatus(id, 'In_Progress').subscribe({
      next: () => this.loadInterventions(),
      error: () => { this.errorMessage = 'Erreur lors du démarrage.'; this.cdr.detectChanges(); }
    });
  }

  openCompletePanel(id: number): void {
    this.completeInterventionId = id;
    this.solutionForm.reset({ solution: '' });
    while (this.partsArray.length) this.partsArray.removeAt(0);
    this.cdr.detectChanges();
  }

  cancelComplete(): void {
    this.completeInterventionId = null;
    this.cdr.detectChanges();
  }

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

  confirmComplete(): void {
    if (this.solutionForm.get('solution')?.invalid || !this.completeInterventionId) {
      this.solutionForm.markAllAsTouched();
      return;
    }
    this.isCompleting = true;

    const solution = this.solutionForm.get('solution')!.value;

    // Ne garder que les lignes où une pièce a bien été sélectionnée
    const parts = this.partsArray.controls
      .filter(c => c.get('sparePartId')?.value)
      .map(c => ({
        sparePartId: c.get('sparePartId')!.value,
        quantityUsed: c.get('quantityUsed')!.value
      }));

    this.interventionService.complete(this.completeInterventionId, solution, parts).subscribe({
      next: () => {
        this.isCompleting = false;
        this.completeInterventionId = null;
        this.loadInterventions();
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
}