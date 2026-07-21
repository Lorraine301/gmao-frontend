import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ChatComponent } from './features/assistant/components/chat/chat.component';
import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, ChatComponent, ToastComponent],
  template: `
    <app-navbar *ngIf="showNavbar"></app-navbar>
    <router-outlet></router-outlet>
    <app-chat *ngIf="showNavbar"></app-chat>
    <app-toast *ngIf="showNavbar"></app-toast>
  `
})
export class App {
  constructor(private authService: AuthService, private router: Router) {}

  get showNavbar(): boolean {
    // Masquer la navbar sur les pages login et unauthorized
    const hiddenRoutes = ['/login', '/unauthorized'];
    return this.authService.isLoggedIn() &&
           !hiddenRoutes.some(r => this.router.url.startsWith(r));
  }
}