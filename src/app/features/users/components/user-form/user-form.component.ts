import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { UserRequest } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  userId?: number;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idParam;
    this.userId = idParam ? +idParam : undefined;

    this.form = this.fb.group({
      employeeCode: ['', Validators.required],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      roleName: ['Technician', Validators.required],
      speciality: [''],
      availabilityStatus: ['Available']
    });

    if (this.isEditMode && this.userId) {
      this.userService.findById(this.userId).subscribe({
        next: (u) => {
          this.form.patchValue({
            employeeCode: u.employeeCode,
            fullName: u.fullName,
            email: u.email,
            roleName: u.role,
            speciality: u.speciality,
            availabilityStatus: u.availabilityStatus
          });
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    const dto: UserRequest = { ...this.form.value };
    if (this.isEditMode && !dto.password) {
      delete dto.password; // ne pas changer le mot de passe si laissé vide
    }

    const request$ = this.isEditMode && this.userId
      ? this.userService.update(this.userId, dto)
      : this.userService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.error ?? 'Erreur lors de l\'enregistrement.';
        this.cdr.detectChanges();
      }
    });
  }
}