import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppNotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models/notification.model';
import { interval, Subscription } from 'rxjs';
import { WebsocketService } from '../../../core/services/websocket.service';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule,TranslatePipe],
  template: `
    <nav class="navbar">
    <button class="sidebar-toggle-btn" *ngIf="!isTechnician" (click)="toggleSidebar.emit()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
     <div class="navbar__brand" *ngIf="isTechnician">
        <img src="./images/logo_suprajit.png" alt="Suprajit" class="navbar__logo" width="36" height="36" />
        <span class="navbar__title">GMAO Intelligente</span>
      </div>

      <div class="navbar__links">
        <a *ngFor="let link of navLinks" [routerLink]="link.path" routerLinkActive="active"
          [title]="link.label | translate">
          <svg *ngIf="link.path === '/dashboard'" class="nav-icon" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="9" rx="1"/>
            <rect x="14" y="3" width="7" height="5" rx="1"/>
            <rect x="14" y="12" width="7" height="9" rx="1"/>
            <rect x="3" y="16" width="7" height="5" rx="1"/>
          </svg>
          <svg *ngIf="link.path === '/users'" class="nav-icon" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <svg *ngIf="link.path === '/stock'" class="nav-icon" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <svg *ngIf="link.path === '/reports'" class="nav-icon" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
          <span *ngIf="link.path !== '/dashboard' && link.path !== '/users' && link.path !== '/stock' && link.path !== '/reports'">{{ link.label | translate }}</span>
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
                <div class="notif-icon" [ngClass]="'notif-icon--' + n.type.toLowerCase()">
                  <svg *ngIf="n.type === 'Critical'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <svg *ngIf="n.type === 'Warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <svg *ngIf="n.type === 'Info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </div>
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
            <span class="navbar__role">{{ 'roles.' + user?.role | translate }}</span>
          </div>
        </div>
         <button class="lang-toggle" (click)="toggleLanguage()">
          <img [src]="currentLang === 'fr' ? 'assets/gb.svg' : 'assets/fr.svg'" alt="" width="20" />
          {{ currentLang === 'fr' ? 'EN' : 'FR' }}
        </button>
        <button class="navbar__logout" (click)="logout()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {{ 'nav.logout' | translate }}
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
    .notif-icon {
      width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      svg { width: 14px; height: 14px; }

      &--critical { background: #ffebee; color: #c62828; }
      &--warning  { background: #fff3e0; color: #e65100; }
      &--info     { background: #e3f2fd; color: #1565c0; }
    }
    .notif-content { flex: 1; min-width: 0; }
    .notif-message { font-size: 0.82rem; color: #1a202c; margin: 0 0 4px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .notif-date { font-size: 0.72rem; color: #718096; }
    .lang-toggle {
      padding: 7px 12px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      color: rgba(255,255,255,0.85);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      &:hover { background: rgba(255,255,255,0.18); color: white; }
    }
    .nav-icon {
      width: 18px;
      height: 18px;
      display: block;
    }
    .sidebar-toggle-btn {
      background: none; border: none; color: white; cursor: pointer;
      padding: 8px; margin-right: 8px; display: flex; align-items: center;
      border-radius: 6px; transition: background 0.15s;
      svg { width: 20px; height: 20px; }
      &:hover { background: rgba(255,255,255,0.1); }
    }
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
  @Output() toggleSidebar = new EventEmitter<void>();

  private pollSubscription?: Subscription;
  private wsSub?: Subscription;

  constructor(
    private authService: AuthService,
    private notifService: AppNotificationService,
    private wsService: WebsocketService,  
    private languageService: LanguageService, 
    private cdr: ChangeDetectorRef 
  ) {}

  get currentLang(): string {
  return this.languageService.getCurrentLanguage();
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }

  ngOnInit(): void {
    this.navLinks = this.computeNavLinks();

    if (this.authService.isLoggedIn()) {
      this.loadNotifications();
      // Polling en filet de sécurité (60s, moins fréquent puisque le WebSocket est prioritaire)
      this.pollSubscription = interval(60000).subscribe(() => {
        this.loadNotifications();
      });

      // Mise à jour instantanée via WebSocket
      this.wsSub = this.wsService.notification$.subscribe(() => {
        this.loadNotifications();
      });
    }
  }
  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
    this.wsSub?.unsubscribe();
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
      { label: 'nav.myInterventions', path: '/my-interventions' },
      { label: 'nav.myPreventiveMaintenance', path: '/my-preventive-maintenance' }
    ];
  }

  return [
    { label: 'nav.dashboard', path: '/dashboard' },
    { label: 'nav.users', path: '/users' },
    { label: 'nav.equipments', path: '/equipments' },
    { label: 'nav.failures', path: '/failures' },
    { label: 'nav.interventions', path: '/interventions' },
    { label: 'nav.maintenance', path: '/preventive-maintenance' },
    { label: 'nav.reports', path: '/reports' },
    { label: 'nav.stock', path: '/stock' }
  ];
}

  getInitials(): string {
    const name = this.user?.fullName ?? '';
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  logout(): void { this.authService.logout(); }
  get isTechnician(): boolean {
  return this.authService.getRole() === 'Technician';
}
}
