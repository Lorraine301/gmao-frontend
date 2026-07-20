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
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor'] },
  loadComponent: () =>
    import('./features/dashboard/components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
},

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

// ── Maintenance préventive ──────────────────────────────
{
  path: 'preventive-maintenance',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor'] },
  loadComponent: () =>
    import('./features/preventive-maintenance/components/planning-list/planning-list.component')
      .then(m => m.PlanningListComponent)
},

// ── Stock ────────────────────────────────────────────────
{
  path: 'stock',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor'] },
  loadComponent: () =>
    import('./features/stock/components/stock-list/stock-list.component')
      .then(m => m.StockListComponent)
},
{
  path: 'stock/new',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin'] },
  loadComponent: () =>
    import('./features/stock/components/stock-form/stock-form.component')
      .then(m => m.StockFormComponent)
},
{
  path: 'stock/consumption-history',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor'] },
  loadComponent: () =>
    import('./features/stock/components/consumption-history/consumption-history.component')
      .then(m => m.ConsumptionHistoryComponent)
},
{
  path: 'stock/:id/edit',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin'] },
  loadComponent: () =>
    import('./features/stock/components/stock-form/stock-form.component')
      .then(m => m.StockFormComponent)
},

// ── Mes maintenances préventives (technicien) ────────────
{
  path: 'my-preventive-maintenance',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Technician'] },
  loadComponent: () =>
    import('./features/preventive-maintenance/components/my-preventive-maintenance-list/my-preventive-maintenance-list.component')
      .then(m => m.MyPreventiveMaintenanceListComponent)
},
{
  path: 'my-preventive-maintenance/:id',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Technician'] },
  loadComponent: () =>
    import('./features/preventive-maintenance/components/my-preventive-maintenance-detail/my-preventive-maintenance-detail.component')
      .then(m => m.MyPreventiveMaintenanceDetailComponent)
},

{
  path: 'my-archive',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Technician'] },
  loadComponent: () =>
    import('./features/archive/components/my-archive/my-archive.component')
      .then(m => m.MyArchiveComponent)
},

{
  path: 'reports',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor'] },
  loadComponent: () =>
    import('./features/reporting/components/weekly-report-list/weekly-report-list.component')
      .then(m => m.WeeklyReportListComponent)
},
{
  path: 'reports/weekly/:id',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor'] },
  loadComponent: () =>
    import('./features/reporting/components/weekly-report-detail/weekly-report-detail.component')
      .then(m => m.WeeklyReportDetailComponent)
},
// ── Utilisateurs (Admin uniquement) ──────────────────────
{
  path: 'users',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Supervisor'] },
  loadComponent: () =>
    import('./features/users/components/user-list/user-list.component')
      .then(m => m.UserListComponent)
},
{
  path: 'users/new',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin'] },
  loadComponent: () =>
    import('./features/users/components/user-form/user-form.component')
      .then(m => m.UserFormComponent)
},
{
  path: 'users/:id/edit',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin'] },
  loadComponent: () =>
    import('./features/users/components/user-form/user-form.component')
      .then(m => m.UserFormComponent)
},
{
  path: 'users/:id',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin','Supervisor'] },
  loadComponent: () =>
    import('./features/users/components/user-detail/user-detail.component')
      .then(m => m.UserDetailComponent)
},

// ── Profil (tous les rôles connectés) ─────────────────────
{
  path: 'profile',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/users/components/profile/profile.component')
      .then(m => m.ProfileComponent)
},
  // Redirections par rôle (placeholders à remplacer sprint par sprint)
 // { path: 'technician', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'admin',      redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'supervisor', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'technician', redirectTo: '/my-interventions', pathMatch: 'full' },

  { path: '**', redirectTo: '/login' }
];