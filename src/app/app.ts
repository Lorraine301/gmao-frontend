import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ChatComponent } from './features/assistant/components/chat/chat.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, SidebarComponent, ChatComponent, ToastComponent],
  template: `
    <app-navbar *ngIf="showNavbar" (toggleSidebar)="onToggleSidebar()"></app-navbar>

    <div class="body-shell">
      <app-sidebar *ngIf="showSidebar" [isOpen]="sidebarOpen"></app-sidebar>
      <div class="content-area">
        <router-outlet></router-outlet>
      </div>
    </div>

    <app-chat *ngIf="showNavbar"></app-chat>
    <app-toast *ngIf="showNavbar"></app-toast>
  `,
  styles: [`
    .body-shell { display: flex; min-height: calc(100vh - 64px); }
    .content-area { flex: 1; min-width: 0; }
  `]
})
export class App {
  sidebarOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService
  ) {}

  get showNavbar(): boolean {
    const hiddenRoutes = ['/login', '/unauthorized'];
    return this.authService.isLoggedIn() &&
           !hiddenRoutes.some(r => this.router.url.startsWith(r));
  }

  onToggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
  get showSidebar(): boolean {
  return this.showNavbar && this.authService.getRole() !== 'Technician';
  }
}