import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FailureService } from '../../services/failure.service';
import { EquipmentService } from '../../../equipments/services/equipment.service';
import { Equipment } from '../../../equipments/models/equipment.model';

@Component({
  selector: 'app-failure-declare',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './failure-declare.component.html',
  styleUrl: './failure-declare.component.scss'
})
export class FailureDeclareComponent implements OnInit {

  form!: FormGroup;
  equipments: Equipment[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  failureTypeOptions = ['Mechanical', 'Electrical', 'Other'];

  constructor(
    private fb: FormBuilder,
    private failureService: FailureService,
    private equipmentService: EquipmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      equipmentId:    [null, Validators.required],
      title:          ['', [Validators.required, Validators.maxLength(150)]],
      description:    ['', Validators.required],
      failureType:    ['Mechanical'],
      reportedChannel:['Web']
    });

    this.isLoading = true;
    this.equipmentService.findAll().subscribe({
      next: (data) => { this.equipments = data; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    this.failureService.declare(this.form.value).subscribe({
      next: () => { this.isSaving = false; this.router.navigate(['/failures']); },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.status === 404 ? 'Équipement introuvable.' : 'Erreur lors de la déclaration.';
        this.cdr.detectChanges();
      }
    });
  }
}