import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProfileService } from '../../../../core/services/profile.service';
import { UserProfile } from '../../models/user.model';
import { AuthService } from '../../../../core/services/auth.service';

// ── Validateur : les deux nouveaux mots de passe doivent correspondre ──
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  profile?: UserProfile;
  isLoading = true;
  errorMessage = '';

  // ── Changement de mot de passe ────────────────────────────
  showPasswordForm = false;
  passwordForm!: FormGroup;
  isChangingPassword = false;
  passwordError = '';
  passwordSuccess = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  //changement de statu technicien
  isUpdatingAvailability = false;
  availabilityError = '';


  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.profileService.getMyProfile().subscribe({
      next: (p) => { this.profile = p; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.errorMessage = 'Erreur de chargement du profil.'; this.isLoading = false; this.cdr.detectChanges(); }
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatchValidator });
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordForm.reset();
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.profileService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordSuccess = 'Mot de passe changé avec succès.';
        this.passwordForm.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.passwordError = err.error?.error ?? 'Erreur lors du changement de mot de passe.';
        this.cdr.detectChanges();
      }
    });
  }
    toggleFieldVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  getRoleLabel(r: string): string {
    return { Admin: 'Admin', Supervisor: 'Superviseur', Technician: 'Technicien' }[r] ?? r;
  }
  get isTechnician(): boolean {
  return this.profile?.role === 'Technician';
  }

  toggleAvailability(): void {
    if (!this.profile) return;
    const newStatus = this.profile.availabilityStatus === 'Available' ? 'Unavailable' : 'Available';
    this.isUpdatingAvailability = true;
    this.availabilityError = '';

    this.authService.updateMyAvailability(newStatus).subscribe({
      next: () => {
        this.profile!.availabilityStatus = newStatus;
        this.isUpdatingAvailability = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isUpdatingAvailability = false;
        this.availabilityError = 'Erreur lors de la mise à jour.';
        this.cdr.detectChanges();
      }
    });
  }
}