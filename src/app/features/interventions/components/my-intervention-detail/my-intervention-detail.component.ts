import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InterventionService } from '../../services/intervention.service';
import { EquipmentService } from '../../../equipments/services/equipment.service';
import { Intervention } from '../../models/intervention.model';
import { Equipment } from '../../../equipments/models/equipment.model';

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
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  completeForm!: FormGroup;
  isCompleting = false;
  showCompleteForm = false;

  constructor(
    private route: ActivatedRoute,
    private interventionService: InterventionService,
    private equipmentService: EquipmentService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.completeForm = this.fb.group({
      solution: ['', [Validators.required, Validators.minLength(10)]]
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadIntervention(+id);
  }

  loadIntervention(id: number): void {
    this.isLoading = true;
    this.interventionService.findMy().subscribe({
      next: (list) => {
        this.intervention = list.find(i => i.id === id);
        if (!this.intervention) {
          this.errorMessage = 'Intervention introuvable ou non assignée.';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }
        // Charger les détails complets de l'équipement
        this.loadEquipment(this.intervention.failureId);
      },
      error: () => {
        this.errorMessage = 'Erreur de chargement.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadEquipment(failureId: number): void {
    // On utilise le failureId pour retrouver l'équipement via son code
    // On cherche l'équipement depuis la liste en filtrant par code
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

  submitComplete(): void {
    if (this.completeForm.invalid || !this.intervention) {
      this.completeForm.markAllAsTouched();
      return;
    }
    this.isCompleting = true;
    this.interventionService.complete(
      this.intervention.id,
      this.completeForm.get('solution')!.value
    ).subscribe({
      next: (updated) => {
        this.intervention = updated;
        this.isCompleting = false;
        this.showCompleteForm = false;
        this.successMessage = 'Intervention clôturée avec succès.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.isCompleting = false;
        this.errorMessage = 'Erreur lors de la clôture.';
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