import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Redirection par défaut
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Page de login (publique)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // Page non autorisée (publique)
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // Zone Admin
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
      // ← sera remplacé par AdminDashboardComponent en Sprint 4
  },

  // Zone Supervisor
  {
    path: 'supervisor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Supervisor', 'Admin'] },
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
      // ← sera remplacé par SupervisorDashboardComponent
  },

  // Zone Technician
  {
    path: 'technician',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Technician', 'Admin'] },
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
      // ← sera remplacé par TechnicianDashboardComponent
  },

  // Wildcard
  { path: '**', redirectTo: '/login' }
];