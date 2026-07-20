import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppNotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models/notification.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar__brand">
        <img src="./images/logo_suprajit.png" alt="Suprajit" class="navbar__logo" width="36" height="36" />
        <span class="navbar__title">GMAO Intelligente</span>
      </div>

      <div class="navbar__links">
        <a *ngFor="let link of navLinks" [routerLink]="link.path" routerLinkActive="active">
          {{ link.label }}
        </a>
      </div>

      <div class="navbar__user">

        <!-- Cloche notifications -->
        <div class="notif-wrapper" (click)="toggleNotifPanel($event)">
          <button class="notif-btn" [class.notif-btn--has-new]="unreadCount > 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="notif-badge" *ngIf="unreadCount > 0">
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
          </button>

          <!-- Dropdown notifications -->
          <div class="notif-panel" *ngIf="showNotifPanel" (click)="$event.stopPropagation()">
            <div class="notif-panel__header">
              <span>Notifications</span>
              <button class="btn-read-all" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
                Tout marquer comme lu
              </button>
            </div>

            <div class="notif-list">
              <div *ngIf="notifications.length === 0" class="notif-empty">
                Aucune notification
              </div>
              <div *ngFor="let n of notifications.slice(0, 5)"
                   class="notif-item"
                   [class.notif-item--unread]="n.status === 'Unread'"
                   (click)="markAsRead(n)">
                <div class="notif-dot" [ngClass]="'notif-dot--' + n.type.toLowerCase()"></div>
                <div class="notif-content">
                  <p class="notif-message">{{ n.message }}</p>
                  <span class="notif-date">
                    {{ n.notificationDate | date:'dd/MM HH:mm' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="navbar__profile" routerLink="/profile" style="cursor: pointer;">
          <div class="navbar__avatar">{{ getInitials() }}</div>
          <div class="navbar__info">
            <span class="navbar__name">{{ user?.fullName }}</span>
            <span class="navbar__role">{{ user?.role }}</span>
          </div>
        </div>

        <button class="navbar__logout" (click)="logout()">
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
    .navbar { display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 64px; background: #1E3A5F; box-shadow: 0 2px 8px rgba(0,0,0,0.2); position: sticky; top: 0; z-index: 100; }
    .navbar__brand { display: flex; align-items: center; gap: 12px; }
    .navbar__logo  { width: 36px; height: 36px; object-fit: contain; }
    .navbar__title { font-size: 1rem; font-weight: 700; color: white; letter-spacing: 0.3px; }
    .navbar__links { display: flex; gap: 4px; }
    .navbar__links a { color: rgba(255,255,255,0.7); text-decoration: none; padding: 6px 14px; border-radius: 6px; font-size: 0.88rem; transition: all 0.15s; }
    .navbar__links a:hover, .navbar__links a.active { color: white; background: rgba(255,255,255,0.12); }
    .navbar__user { display: flex; align-items: center; gap: 12px; }
    .navbar__profile { display: flex; align-items: center; gap: 10px; }
    .navbar__avatar { width: 36px; height: 36px; background: #2E75B6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; color: white; }
    .navbar__info { display: flex; flex-direction: column; }
    .navbar__name { font-size: 0.85rem; font-weight: 600; color: white; }
    .navbar__role { font-size: 0.72rem; color: rgba(255,255,255,0.6); }
    .navbar__logout { display: flex; align-items: center; gap: 6px; padding: 7px 14px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: rgba(255,255,255,0.85); font-size: 0.85rem; cursor: pointer; transition: all 0.15s; }
    .navbar__logout svg { width: 15px; height: 15px; }
    .navbar__logout:hover { background: rgba(220,50,50,0.3); border-color: rgba(220,50,50,0.5); color: white; }

    /* Cloche */
    .notif-wrapper { position: relative; }
    .notif-btn { position: relative; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 8px; cursor: pointer; color: rgba(255,255,255,0.85); display: flex; align-items: center; transition: all 0.15s; }
    .notif-btn svg { width: 18px; height: 18px; }
    .notif-btn:hover, .notif-btn--has-new { background: rgba(255,255,255,0.18); color: white; }
    .notif-badge { position: absolute; top: -5px; right: -5px; background: #e53e3e; color: white; border-radius: 10px; font-size: 0.65rem; font-weight: 700; min-width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; padding: 0 4px; border: 2px solid #1E3A5F; }

    /* Panel dropdown */
    .notif-panel { position: absolute; top: calc(100% + 10px); right: 0; width: 360px; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 200; overflow: hidden; }
    .notif-panel__header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; font-weight: 700; color: #1E3A5F; }
    .btn-read-all { background: none; border: none; color: #2E75B6; font-size: 0.78rem; cursor: pointer; font-weight: 600; &:hover { text-decoration: underline; } }
    .notif-list { max-height: 320px; overflow-y: auto; }
    .notif-empty { padding: 32px; text-align: center; color: #718096; font-size: 0.88rem; }
    .notif-item { display: flex; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #f0f0f0; &:last-child { border-bottom: none; } &:hover { background: #f8fafc; } &--unread { background: #f0f7ff; } }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; &--info { background: #2E75B6; } &--warning { background: #e65100; } &--critical { background: #c62828; } }
    .notif-content { flex: 1; min-width: 0; }
    .notif-message { font-size: 0.82rem; color: #1a202c; margin: 0 0 4px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .notif-date { font-size: 0.72rem; color: #718096; }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {

  notifications: AppNotification[] = [];
  unreadCount = 0;
  showNotifPanel = false;

  // ── Calculé une seule fois dans ngOnInit (voir ci-dessous) ──
  // Ne JAMAIS remettre ça en `get navLinks()` : un getter réévalué à
  // chaque cycle de détection de changement renvoie un nouveau tableau
  // (nouvelle référence) à chaque fois, ce qui déclenche une boucle
  // infinie de détection de changement (erreur NG0103) sur le *ngFor.
  navLinks: { label: string; path: string }[] = [];

  private pollSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private notifService: AppNotificationService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.navLinks = this.computeNavLinks();

    if (this.authService.isLoggedIn()) {
      this.loadNotifications();
      // Polling toutes les 30 secondes
      this.pollSubscription = interval(30000).subscribe(() => {
        this.loadNotifications();
      });
    }
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showNotifPanel = false;
  }

  loadNotifications(): void {
    this.notifService.findMine().subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => n.status === 'Unread').length;
        this.cdr.detectChanges(); // Forcer la détection de changement après la mise à jour des notifications
      }
    });
  }

  toggleNotifPanel(event: Event): void {
    event.stopPropagation();
    this.showNotifPanel = !this.showNotifPanel;
  }

  markAsRead(notification: AppNotification): void {
    if (notification.status === 'Unread') {
      this.notifService.markAsRead(notification.id).subscribe({
        next: () => { notification.status = 'Read'; this.unreadCount = Math.max(0, this.unreadCount - 1); this.cdr.detectChanges(); }
      });
    }
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead().subscribe({
      next: () => { this.notifications.forEach(n => n.status = 'Read'); this.unreadCount = 0; this.cdr.detectChanges(); }
    });
  }

  get user() { return this.authService.getCurrentUser(); }

  private computeNavLinks(): { label: string; path: string }[] {
    const role = this.authService.getRole();

   if (role === 'Technician') {
    return [
      { label: 'Mes interventions', path: '/my-interventions' },
      { label: 'Maintenance préventive', path: '/my-preventive-maintenance' }
    ];
  }

    // Supervisor et Admin ont la même liste actuellement
    return [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Équipements', path: '/equipments' },
      { label: 'Utilisateurs', path: '/users' },
      { label: 'Pannes', path: '/failures' },
      { label: 'Interventions', path: '/interventions' },
      { label: 'Maintenance', path: '/preventive-maintenance' },
      { label: 'Stock', path: '/stock' },
      { label: 'Rapports', path: '/reports' }
    ];
  }

  getInitials(): string {
    const name = this.user?.fullName ?? '';
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  logout(): void { this.authService.logout(); }
}
