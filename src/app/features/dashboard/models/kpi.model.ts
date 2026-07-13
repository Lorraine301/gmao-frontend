export interface KpiSummary {
  totalFailures: number;
  resolvedFailures: number;
  resolutionRate: number;
  averageMttr: number | null;
  periodDays: number;
}

export interface EquipmentFailureCount {
  equipmentId: number;
  equipmentCode: string;
  equipmentName: string;
  failureCount: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface PriorityCount {
  priority: string;
  count: number;
}

export interface TechnicianWorkload {
  technicianId: number;
  technicianName: string;
  employeeCode: string;
  interventionCount: number;
}

export interface MonthlyTrend {
  month: string;         // "yyyy-MM"
  failureCount: number;
  interventionCount: number;
}

export interface MttrResponse {
  equipmentId: number | null;
  equipmentCode: string | null;
  mttr: number | null;
  periodDays: number;
}

export interface AvailabilityResponse {
  equipmentId: number | null;
  equipmentCode: string | null;
  availabilityRate: number;
  periodDays: number;
}