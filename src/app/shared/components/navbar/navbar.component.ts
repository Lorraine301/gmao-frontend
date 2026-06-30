import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar__brand">
        <img src="./images/logo_suprajit.png" alt="Suprajit" class="navbar__logo" />
        <span class="navbar__title">GMAO Intelligente</span>
      </div>

      <div class="navbar__links">
        <a routerLink="/equipments" routerLinkActive="active">Équipements</a>
      </div>

      <div class="navbar__user">
        <div class="navbar__profile">
          <div class="navbar__avatar">
            {{ getInitials() }}
          </div>
          <div class="navbar__info">
            <span class="navbar__name">{{ user?.fullName }}</span>
            <span class="navbar__role badge--role">{{ user?.role }}</span>
          </div>
        </div>
        <button class="navbar__logout" (click)="logout()" title="Se déconnecter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      height: 64px;
      background: #1E3A5F;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar__brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .navbar__logo {
      width: 36px;
      height: 36px;
      object-fit: contain;
    }
    .navbar__title {
      font-size: 1rem;
      font-weight: 700;
      color: white;
      letter-spacing: 0.3px;
    }
    .navbar__links {
      display: flex;
      gap: 8px;

      a {
        color: rgba(255,255,255,0.7);
        text-decoration: none;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 0.88rem;
        transition: all 0.15s;
        &:hover, &.active {
          color: white;
          background: rgba(255,255,255,0.12);
        }
      }
    }
    .navbar__user {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .navbar__profile {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .navbar__avatar {
      width: 36px;
      height: 36px;
      background: #2E75B6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: white;
    }
    .navbar__info {
      display: flex;
      flex-direction: column;
    }
    .navbar__name {
      font-size: 0.85rem;
      font-weight: 600;
      color: white;
    }
    .navbar__role {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.6);
    }
    .navbar__logout {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      color: rgba(255,255,255,0.85);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s;
      svg { width: 15px; height: 15px; }
      &:hover {
        background: rgba(220,50,50,0.3);
        border-color: rgba(220,50,50,0.5);
        color: white;
      }
    }
  `]
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}

  get user() {
    return this.authService.getCurrentUser();
  }

  getInitials(): string {
    const name = this.user?.fullName ?? '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}