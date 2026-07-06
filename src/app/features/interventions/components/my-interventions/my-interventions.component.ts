import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InterventionService } from '../../services/intervention.service';
import { Intervention } from '../../models/intervention.model';

@Component({
  selector: 'app-my-interventions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './my-interventions.component.html',
  styleUrl: './my-interventions.component.scss'
})
export class MyInterventionsComponent implements OnInit {

  interventions: Intervention[] = [];
  isLoading = false;
  errorMessage = '';

  completeInterventionId: number | null = null;
  solutionForm!: FormGroup;
  isCompleting = false;

  constructor(
    private interventionService: InterventionService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.solutionForm = this.fb.group({
      solution: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.loadInterventions();
  }

  loadInterventions(): void {
    this.isLoading = true;
    this.interventionService.findMy().subscribe({
      next: (data) => { this.interventions = [...data]; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.errorMessage = 'Erreur de chargement.'; this.cdr.detectChanges(); }
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
    this.solutionForm.reset();
    this.cdr.detectChanges();
  }

  cancelComplete(): void {
    this.completeInterventionId = null;
    this.cdr.detectChanges();
  }

  confirmComplete(): void {
    if (this.solutionForm.invalid || !this.completeInterventionId) {
      this.solutionForm.markAllAsTouched();
      return;
    }
    this.isCompleting = true;
    const solution = this.solutionForm.get('solution')!.value;
    this.interventionService.complete(this.completeInterventionId, solution).subscribe({
      next: () => {
        this.isCompleting = false;
        this.completeInterventionId = null;
        this.loadInterventions();
      },
      error: () => { this.isCompleting = false; this.errorMessage = 'Erreur lors de la clôture.'; this.cdr.detectChanges(); }
    });
  }

  getPriorityLabel(p: string): string {
    return { Low: 'Faible', Medium: 'Moyen', High: 'Élevé', Critical: 'Critique' }[p] ?? p;
  }
  getStatusLabel(s: string): string {
    return { Pending: 'En attente', In_Progress: 'En cours', Completed: 'Terminée' }[s] ?? s;
  }
}