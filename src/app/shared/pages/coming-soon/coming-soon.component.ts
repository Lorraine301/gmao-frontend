import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="min-height:100vh; display:flex; align-items:center;
                justify-content:center; background:#f8fafc;">
      <div style="text-align:center; padding:48px;">
        <h1 style="color:#1E3A5F; font-size:1.5rem; margin-bottom:12px;">
          Sprint en cours de développement
        </h1>
        <p style="color:#718096; margin-bottom:24px;">
          Cette fonctionnalité sera disponible au prochain sprint.
        </p>
        <button (click)="logout()"
          style="padding:10px 24px; background:#2E75B6; color:white;
                 border:none; border-radius:8px; cursor:pointer; font-size:0.9rem;">
          Se déconnecter
        </button>
      </div>
    </div>
  `
})
export class ComingSoonComponent {
  constructor(private authService: AuthService) {}
  logout(): void { this.authService.logout(); }
}