import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,TranslatePipe, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService
  ) {
    // Rediriger si déjà connecté
    if (this.authService.isLoggedIn()) {
      this.redirectByRole(this.authService.getRole());
    }

    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }
  
  get currentLang(): string {
  return this.languageService.getCurrentLanguage();
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.redirectByRole(response.role);
      },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 0) {
            this.errorMessage = 'login.errorServerUnreachable';
          } else if (err.status === 401 || err.status === 403) {
            this.errorMessage = 'login.errorInvalidCredentials';
          } else {
            this.errorMessage = 'login.errorGeneric';
          }
        }
    });
  }

  private redirectByRole(role: string | null): void {
    switch (role) {
      case 'Admin':      this.router.navigate(['/admin']);      break;
      case 'Supervisor': this.router.navigate(['/supervisor']); break;
      case 'Technician': this.router.navigate(['/technician']); break;
      default:           this.router.navigate(['/login']);
    }
  }
}