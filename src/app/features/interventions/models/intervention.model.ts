export type InterventionStatus = 'Pending' | 'In_Progress' | 'Completed';

export interface Intervention {
  id: number;
  failureId: number;
  failureCode: string;
  failureTitle: string;
  equipmentCode: string;
  equipmentName: string;
  technicianId: number;
  technicianName: string;
  technicianEmployeeCode: string;
  assignedById?: number;
  assignedByName?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  priority: string;
  status: InterventionStatus;
  solution?: string;
  closedById?: number;
  closedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AtRiskEquipment {
  equipmentId: number;
  equipmentCode: string;
  equipmentName: string;
  criticalityLevel: string;
  recentFailuresCount: number;
  averageMttr: number;
  riskReason: string;
  llmExplanation?: string; 
}