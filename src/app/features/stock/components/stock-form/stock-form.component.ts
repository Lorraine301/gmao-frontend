import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SparePartService } from '../../services/spare-part.service';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './stock-form.component.html',
  styleUrl: './stock-form.component.scss'
})
export class StockFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  partId!: number;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private sparePartService: SparePartService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:              ['', Validators.required],
      reference:         ['', Validators.required],
      supplier:          [''],
      warehouseLocation: [''],
      quantity:          [0, [Validators.required, Validators.min(0)]],
      minimumStock:      [0, [Validators.required, Validators.min(0)]],
      unit:              ['Piece'],
      unitPrice:         [null]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.partId = +id;
        this.isLoading = true;
        this.sparePartService.findById(this.partId).subscribe({
          next: (p) => { this.form.patchValue(p); this.isLoading = false; this.cdr.detectChanges(); },
          error: () => { this.isLoading = false; this.errorMessage = 'Pièce introuvable.'; this.cdr.detectChanges(); }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const request$ = this.isEditMode
      ? this.sparePartService.update(this.partId, this.form.value)
      : this.sparePartService.create(this.form.value);
    request$.subscribe({
      next: () => { this.isSaving = false; this.router.navigate(['/stock']); },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.status === 409 ? 'Cette référence existe déjà.' : 'Erreur lors de la sauvegarde.';
        this.cdr.detectChanges();
      }
    });
  }

  isInvalid(f: string): boolean {
    const ctrl = this.form.get(f);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}