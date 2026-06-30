import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

 // ── Équipements ──────────────────────────────────────────
 // Liste → Admin + Supervisor seulement
  {
    path: 'equipments',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Supervisor'] },
    loadComponent: () =>
      import('./features/equipments/components/equipment-list/equipment-list.component')
        .then(m => m.EquipmentListComponent)
  },
  {
    path: 'equipments/new',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import('./features/equipments/components/equipment-form/equipment-form.component')
        .then(m => m.EquipmentFormComponent)
  },
  {
    path: 'equipments/:id/edit',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import('./features/equipments/components/equipment-form/equipment-form.component')
        .then(m => m.EquipmentFormComponent)
  },
  {
    // Détail → Admin + Supervisor + Technician
    path: 'equipments/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Supervisor', 'Technician'] },
    loadComponent: () =>
      import('./features/equipments/components/equipment-detail/equipment-detail.component')
        .then(m => m.EquipmentDetailComponent)
  },
  // ── Dashboard ───────────────────────────────────────────
  {
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./shared/pages/coming-soon/coming-soon.component')
      .then(m => m.ComingSoonComponent)
  },

  // Redirections par rôle (placeholders à remplacer sprint par sprint)
  { path: 'admin',      redirectTo: '/equipments', pathMatch: 'full' },
  { path: 'supervisor', redirectTo: '/equipments', pathMatch: 'full' },
  { path: 'technician', redirectTo: '/dashboard', pathMatch: 'full' },

  { path: '**', redirectTo: '/login' }
];