export interface PreventiveMaintenanceHistory {
  id: number;
  equipmentId: number;
  equipmentCode: string;
  equipmentName: string;
  technicianId: number | null;
  technicianName: string | null;
  maintenanceType: string;
  completedAt: string;
  problemFound: string | null;
  solution: string | null;
}