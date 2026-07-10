import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PreventiveMaintenanceService } from '../../services/preventive-maintenance.service';
import { EquipmentService } from '../../../equipments/services/equipment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService, UserSummary } from '../../../../core/services/user.service';
import { PreventiveMaintenance, PreventiveMaintenanceRequest } from '../../models/preventive-maintenance.model';
import { Equipment } from '../../../equipments/models/equipment.model';

@Component({
  selector: 'app-planning-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './planning-list.component.html',
  styleUrl: './planning-list.component.scss'
})
export class PlanningListComponent implements OnInit {

  maintenances: PreventiveMaintenance[] = [];
  equipments: Equipment[] = [];
  technicians: UserSummary[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  showScheduleForm = false;
  scheduleForm!: FormGroup;
  isScheduling = false;

  completingId: number | null = null;

  // ── Affectation technicien ────────────────────────────────
  assignMaintenanceId: number | null = null;
  selectedTechnicianId: number | null = null;
  isAssigning = false;

  // ── Filtres ────────────────────────────────────────────────
  allMaintenances: PreventiveMaintenance[] = [];
  filterStatus = '';
  filterMaintenanceType = '';
  filterTechnician = '';
  filterUnassignedOnly = false;

  constructor(
    private pmService: PreventiveMaintenanceService,
    private equipmentService: EquipmentService,
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.scheduleForm = this.fb.group({
      equipmentId:         [null, Validators.required],
      maintenanceType:     ['PT', Validators.required],
      frequencyDays:       [90, [Validators.required, Validators.min(1)]],
      lastMaintenanceDate: ['', Validators.required]
    });
    this.loadData();
    this.loadTechnicians();
  }

  get isAdmin(): boolean { return this.authService.getRole() === 'Admin'; }
  get isSupervisorOrAdmin(): boolean {
    return ['Admin', 'Supervisor'].includes(this.authService.getRole() ?? '');
  }

  loadData(): void {
    this.isLoading = true;
    this.pmService.findAll().subscribe({
      next: (data) => {
        this.maintenances = [...data];
        this.allMaintenances = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
    this.equipmentService.findAll().subscribe({
      next: (data) => { this.equipments = data; this.cdr.detectChanges(); }
    });
  }

  loadTechnicians(): void {
    this.userService.getTechnicians().subscribe({
      next: (data) => { this.technicians = data; this.cdr.detectChanges(); }
    });
  }

  openScheduleForm(): void { this.showScheduleForm = true; this.cdr.detectChanges(); }
  closeScheduleForm(): void { this.showScheduleForm = false; this.scheduleForm.reset({ maintenanceType: 'PT', frequencyDays: 90 }); this.cdr.detectChanges(); }

  submitSchedule(): void {
    if (this.scheduleForm.invalid) { this.scheduleForm.markAllAsTouched(); return; }
    this.isScheduling = true;
    const dto: PreventiveMaintenanceRequest = this.scheduleForm.value;
    this.pmService.schedule(dto).subscribe({
      next: () => {
        this.isScheduling = false;
        this.successMessage = 'Maintenance planifiée avec succès.';
        this.closeScheduleForm();
        this.loadData();
      },
      error: () => { this.isScheduling = false; this.errorMessage = 'Erreur lors de la planification.'; this.cdr.detectChanges(); }
    });
  }

  completeMaintenance(id: number): void {
    this.completingId = id;
    this.pmService.complete(id).subscribe({
      next: () => {
        this.completingId = null;
        this.successMessage = 'Maintenance marquée comme terminée.';
        this.loadData();
      },
      error: () => { this.completingId = null; this.errorMessage = 'Erreur.'; this.cdr.detectChanges(); }
    });
  }

  // ── Affectation technicien ────────────────────────────────
  openAssignPanel(maintenanceId: number): void {
    this.assignMaintenanceId = maintenanceId;
    this.selectedTechnicianId = null;
    this.cdr.detectChanges();
  }

  cancelAssign(): void {
    this.assignMaintenanceId = null;
    this.selectedTechnicianId = null;
    this.cdr.detectChanges();
  }

  confirmAssign(): void {
    if (!this.assignMaintenanceId || !this.selectedTechnicianId) return;
    this.isAssigning = true;
    this.pmService.assignTechnician(this.assignMaintenanceId, this.selectedTechnicianId).subscribe({
      next: () => {
        this.isAssigning = false;
        this.assignMaintenanceId = null;
        this.successMessage = 'Technicien affecté avec succès.';
        this.loadData();
      },
      error: (err) => {
        this.isAssigning = false;
        this.errorMessage = err.error?.error ?? 'Erreur lors de l\'affectation.';
        this.cdr.detectChanges();
      }
    });
  }

  getStatusLabel(s: string): string {
    return { Scheduled: 'Planifiée', Overdue: 'En retard', Completed: 'Terminée', Cancelled: 'Annulée' }[s] ?? s;
  }

  getExecutionStatusLabel(s?: string): string {
    if (!s) return '—';
    return { Pending: 'À faire', In_Progress: 'En cours', Completed: 'Terminée' }[s] ?? s;
  }

  getDaysLabel(days: number): string {
    if (days < 0) return `${Math.abs(days)}j de retard`;
    if (days === 0) return 'Aujourd\'hui';
    return `Dans ${days}j`;
  }
  // ── Détails d'une maintenance ──────────────────────────────
  detailMaintenance: PreventiveMaintenance | null = null;

  openDetailPanel(pm: PreventiveMaintenance): void {
    this.detailMaintenance = pm;
    this.cdr.detectChanges();
  }

  closeDetailPanel(): void {
    this.detailMaintenance = null;
    this.cdr.detectChanges();
  }

  get maintenanceTypeOptions(): string[] {
  return [...new Set(this.allMaintenances.map(pm => pm.maintenanceType))].sort();
}

get technicianOptions(): string[] {
  return [...new Set(
    this.allMaintenances
      .filter(pm => pm.assignedTechnicianName)
      .map(pm => pm.assignedTechnicianName!)
  )].sort();
}

applyFilters(): void {
  this.maintenances = this.allMaintenances.filter(pm => {
    if (this.filterStatus && pm.status !== this.filterStatus) return false;
    if (this.filterMaintenanceType && pm.maintenanceType !== this.filterMaintenanceType) return false;
    if (this.filterTechnician && pm.assignedTechnicianName !== this.filterTechnician) return false;
    if (this.filterUnassignedOnly && pm.assignedTechnicianId) return false;
    return true;
  });
  this.cdr.detectChanges();
}

resetFilters(): void {
  this.filterStatus = '';
  this.filterMaintenanceType = '';
  this.filterTechnician = '';
  this.filterUnassignedOnly = false;
  this.maintenances = [...this.allMaintenances];
  this.cdr.detectChanges();
}

get hasActiveFilters(): boolean {
  return !!(this.filterStatus || this.filterMaintenanceType || this.filterTechnician || this.filterUnassignedOnly);
}
}