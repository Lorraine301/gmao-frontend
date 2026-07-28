import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
template: `
  <aside class="sidebar" [class.sidebar--open]="isOpen">
    <div class="sidebar__brand">
      <img src="./images/logo_suprajit.png" alt="Suprajit" class="sidebar__logo" width="30" height="30" />
      <span class="sidebar__title">GMAO Intelligente</span>
    </div>

    <nav class="sidebar__nav">
      <a *ngFor="let link of navLinks" [routerLink]="link.path" routerLinkActive="active" class="sidebar__link">
        <span class="sidebar__icon" [innerHTML]="link.icon"></span>
        <span class="sidebar__label">{{ link.label | translate }}</span>
      </a>
    </nav>
  </aside>
`,
  styles: [`
    .sidebar {
      width: 0; overflow: hidden; flex-shrink: 0;
      background: linear-gradient(180deg, #1E3A5F 0%, #16304f 100%);
      transition: width 0.25s ease;
      height: 100%;
    }
    .sidebar--open { width: 230px; }
    .sidebar__nav {
      display: flex; flex-direction: column; padding: 14px 10px; gap: 4px;
      width: 230px; /* largeur fixe interne, pour ne pas écraser le texte pendant l'animation */
    }
    .sidebar__link {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 14px; border-radius: 10px;
      color: rgba(255,255,255,0.75); text-decoration: none;
      font-size: 0.88rem; font-weight: 500; transition: all 0.15s ease;
      white-space: nowrap;
    }
    .sidebar__link:hover { background: rgba(255,255,255,0.08); color: white; }
    .sidebar__link.active {
      background: rgba(255,255,255,0.14); color: white; font-weight: 600;
      box-shadow: inset 3px 0 0 0 #2E75B6;
    }
    .sidebar__icon {
      width: 18px; height: 18px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .sidebar__icon ::ng-deep svg { width: 18px; height: 18px; };
    .sidebar__brand {
    display: flex; align-items: center; gap: 10px;
    padding: 18px 16px; border-bottom: 1px solid rgba(255,255,255,0.12);
    white-space: nowrap;
    }
    .sidebar__logo { border-radius: 6px; flex-shrink: 0; }
    .sidebar__title { color: white; font-weight: 700; font-size: 0.92rem; }
  `]
})
export class SidebarComponent {
  @Input() isOpen = false;

  constructor(private authService: AuthService,private sanitizer: DomSanitizer) {}

get navLinks(): { label: string; path: string; icon: SafeHtml }[] {
    const role = this.authService.getRole();

    const icons: Record<string, string> = {
      dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
      equipments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      failures: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      interventions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      maintenance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      stock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
      reports: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>'
    };

    const wrap = (label: string, path: string, iconKey: string) => ({
      label, path, icon: this.sanitizer.bypassSecurityTrustHtml(icons[iconKey])
    });

    if (role === 'Technician') {
      return [
        wrap('nav.myInterventions', '/my-interventions', 'interventions'),
        wrap('nav.myPreventiveMaintenance', '/my-preventive-maintenance', 'maintenance')
      ];
    }

    return [
      wrap('nav.dashboard', '/dashboard', 'dashboard'),
      wrap('nav.equipments', '/equipments', 'equipments'),
      wrap('nav.users', '/users', 'users'),
      wrap('nav.failures', '/failures', 'failures'),
      wrap('nav.interventions', '/interventions', 'interventions'),
      wrap('nav.maintenance', '/preventive-maintenance', 'maintenance'),
      wrap('nav.stock', '/stock', 'stock'),
      wrap('nav.reports', '/reports', 'reports')
    ];
  }
}