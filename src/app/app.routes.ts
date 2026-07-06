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
  /*{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./shared/pages/coming-soon/coming-soon.component')
      .then(m => m.ComingSoonComponent)
  },*/

  // ── Pannes ───────────────────────────────────────────────
{
  path: 'failures',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor'] },
  loadComponent: () =>
    import('./features/failures/components/failure-list/failure-list.component')
      .then(m => m.FailureListComponent)
},
{
  path: 'failures/declare',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor'] },
  loadComponent: () =>
    import('./features/failures/components/failure-declare/failure-declare.component')
      .then(m => m.FailureDeclareComponent)
},
{
  path: 'failures/:id',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor', 'Technician'] },
  loadComponent: () =>
    import('./features/failures/components/failure-detail/failure-detail.component')
      .then(m => m.FailureDetailComponent)
},

// ── Interventions ────────────────────────────────────────
{
  path: 'my-interventions',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Technician'] },
  loadComponent: () =>
    import('./features/interventions/components/my-interventions/my-interventions.component')
      .then(m => m.MyInterventionsComponent)
},
{
  path: 'my-interventions/:id',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Technician'] },
  loadComponent: () =>
    import('./features/interventions/components/my-intervention-detail/my-intervention-detail.component')
      .then(m => m.MyInterventionDetailComponent)
},
{
  path: 'interventions',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor'] },
  loadComponent: () =>
    import('./features/interventions/components/intervention-list/intervention-list.component')
      .then(m => m.InterventionListComponent)
},

{
  path: 'interventions/:id',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor'] },
  loadComponent: () =>
    import('./features/interventions/components/intervention-detail/intervention-detail.component')
      .then(m => m.InterventionDetailComponent)
},
  // Redirections par rôle (placeholders à remplacer sprint par sprint)
 // { path: 'technician', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'admin',      redirectTo: '/failures', pathMatch: 'full' },
  { path: 'supervisor', redirectTo: '/failures', pathMatch: 'full' },
  { path: 'technician', redirectTo: '/my-interventions', pathMatch: 'full' },

  { path: '**', redirectTo: '/login' }
];