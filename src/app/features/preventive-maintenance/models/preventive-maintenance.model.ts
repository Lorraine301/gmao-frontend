import { ConsumeStockRequest } from '../../stock/models/spare-part.model';

export type MaintenanceStatus = 'Scheduled' | 'Overdue' | 'Completed' | 'Cancelled';
export type ExecutionStatus = 'Pending' | 'In_Progress' | 'Completed';

export interface PreventiveMaintenance {
  id: number;
  equipmentId: number;
  equipmentCode: string;
  equipmentName: string;
  equipmentType?: string;
  equipmentLocation?: string;
  maintenanceType: string;
  frequencyDays: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  nextReminderDate?: string;
  status: MaintenanceStatus;
  daysUntilNext: number;
  createdAt: string;
  updatedAt: string;

  // ── Affectation technicien (nouveau) ──────────────────────
  assignedTechnicianId?: number;
  assignedTechnicianName?: string;
  assignedByName?: string;
  executionStatus?: ExecutionStatus;   // undefined tant que non assignée
  problemFound?: string;
  solution?: string;
  technicianStartTime?: string;
  technicianEndTime?: string;
}

export interface PreventiveMaintenanceRequest {
  equipmentId: number;
  maintenanceType: string;
  frequencyDays: number;
  lastMaintenanceDate: string;
}

// ── Nouveau : affectation d'un technicien ──────────────────
export interface AssignTechnicianRequest {
  technicianId: number;
}

export interface CompletePreventiveMaintenanceRequest {
  problemFound?: string | null;
  solution?: string | null;
  parts?: ConsumeStockRequest[];
}