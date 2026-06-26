import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauth-wrapper">
      <div class="unauth-card">
        <div class="unauth-icon">🔐</div>
        <h1>Accès non autorisé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <div class="unauth-actions">
          <button class="btn-primary" (click)="goToDashboard()">
            Retour à mon espace
          </button>
          <button class="btn-secondary" (click)="logout()">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1E3A5F, #2E75B6);
    }
    .unauth-card {
      text-align: center;
      padding: 56px 48px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.25);
      max-width: 420px;
      width: 90%;
      animation: pop 0.3s ease-out;
    }
    @keyframes pop {
      from { transform: scale(0.92); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }
    .unauth-icon { font-size: 3.5rem; margin-bottom: 16px; }
    h1 { color: #1E3A5F; font-size: 1.5rem; margin-bottom: 12px; }
    p  { color: #666; font-size: 0.95rem; margin-bottom: 32px; line-height: 1.6; }
    .unauth-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .btn-primary {
      padding: 12px 28px;
      background: linear-gradient(135deg, #1E3A5F, #2E75B6);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
      transition: opacity 0.2s;
      &:hover { opacity: 0.9; }
    }
    .btn-secondary {
      padding: 12px 28px;
      background: transparent;
      color: #2E75B6;
      border: 1.5px solid #2E75B6;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
      transition: all 0.2s;
      &:hover { background: #f0f7ff; }
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router, private authService: AuthService) {}

  goToDashboard(): void {
    const role = this.authService.getRole();
    switch (role) {
      case 'Admin':      this.router.navigate(['/admin']);      break;
      case 'Supervisor': this.router.navigate(['/supervisor']); break;
      case 'Technician': this.router.navigate(['/technician']); break;
      default:           this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}