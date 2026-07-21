import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { EquipmentStatus, CriticalityLevel, EquipmentRequest } from '../../models/equipment.model';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './equipment-form.component.html',
  styleUrl: './equipment-form.component.scss'
})
export class EquipmentFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  equipmentId!: number;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  isDuplicated = false;

  statusOptions: EquipmentStatus[] = ['Active', 'Inactive', 'Under_Maintenance'];
  criticalityOptions: CriticalityLevel[] = ['Low', 'Medium', 'High'];
  typeOptions = ['Extrusion', 'Winding', 'Molding', 'Rolling'];
  categoryOptions = ['Production', 'Support', 'Quality'];

  constructor(
    private fb: FormBuilder,
    private equipmentService: EquipmentService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef  // ← AJOUTER
  ) {}

ngOnInit(): void {
    this.buildForm();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.equipmentId = +id;
        this.loadEquipment();
      } else {
        this.isEditMode = false;
        this.form.reset({ status: 'Active', criticalityLevel: 'Medium', plant: 'Suprajit Morocco' });

        // ── Pré-remplissage si on vient d'une duplication ──
        const navigation = this.router.getCurrentNavigation();
        const duplicateFrom = (navigation?.extras?.state?.['duplicateFrom']
          ?? history.state?.duplicateFrom) as EquipmentRequest | undefined;

        if (duplicateFrom) {
          this.form.patchValue({
            ...duplicateFrom,
            code: '', // ← le code doit être ressaisi, jamais dupliqué
            installationDate: duplicateFrom.installationDate
              ? String(duplicateFrom.installationDate).substring(0, 10) : '',
            commissioningDate: duplicateFrom.commissioningDate
              ? String(duplicateFrom.commissioningDate).substring(0, 10) : ''
          });
          this.isDuplicated = true;
          this.cdr.detectChanges();
        }
      }
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      code:             ['', [Validators.required, Validators.maxLength(30)]],
      name:             ['', [Validators.required, Validators.maxLength(150)]],
      status:           ['Active', Validators.required],
      criticalityLevel: ['Medium', Validators.required],
      description:      [''],
      serialNumber:     [''],
      manufacturer:     [''],
      model:            [''],
      type:             [''],
      category:         [''],
      plant:            ['Suprajit Morocco'],
      productionLine:   [''],
      location:         [''],
      installationDate: [''],
      commissioningDate:[''],
      maintenanceTeam:  [''],
      notes:            ['']
    },{ validators: dateOrderValidator});
  }

  private loadEquipment(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.equipmentService.findById(this.equipmentId).subscribe({
      next: (eq) => {
        this.form.patchValue({
          ...eq,
          installationDate:  eq.installationDate  ? eq.installationDate.substring(0, 10) : '',
          commissioningDate: eq.commissioningDate ? eq.commissioningDate.substring(0, 10) : ''
        });
        this.isLoading = false;
        this.cdr.detectChanges(); // ← FORCER LE RENDU
      },
      error: (err) => {
        this.errorMessage = err.status === 404
          ? 'Cet équipement n\'existe pas ou a été supprimé.'
          : 'Impossible de charger les données de cet équipement.';
        this.isLoading = false;
        this.cdr.detectChanges(); // ← FORCER LE RENDU
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.form.errors?.['dateOrder']) {
      this.form.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const payload = this.form.value;

    const request$ = this.isEditMode
      ? this.equipmentService.update(this.equipmentId, payload)
      : this.equipmentService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/equipments']);
      },
      error: (err) => {
        this.isSaving = false;
        if (err.status === 409) {
          this.errorMessage = 'Ce code équipement existe déjà.';
        } else if (err.status === 400) {
          this.errorMessage = 'Données invalides. Vérifiez les champs obligatoires.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
        this.cdr.detectChanges(); // ← FORCER LE RENDU
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
// Validateur personnalisé à ajouter en dehors de la classe
export const dateOrderValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const installation = form.get('installationDate')?.value;
  const commissioning = form.get('commissioningDate')?.value;

  if (installation && commissioning && commissioning < installation) {
    return { dateOrder: true };
  }
  return null;
};