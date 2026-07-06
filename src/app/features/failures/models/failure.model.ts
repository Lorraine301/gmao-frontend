export type FailurePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type FailureStatus = 'Open' | 'In_Progress' | 'Resolved' | 'Closed';

export interface Failure {
  id: number;
  failureCode: string;
  equipmentId: number;
  equipmentCode: string;
  equipmentName: string;
  equipmentType: string;
  title: string;
  description: string;
  failureType?: string;
  priority: FailurePriority;
  llmPriority?: FailurePriority;
  status: FailureStatus;
  reportedById: number;
  reportedByName: string;
  reportedByEmployeeCode: string;
  reportedChannel: string;
  reportedAt: string;
  resolvedAt?: string;
  llmProcessed: boolean;
  createdAt: string;
  updatedAt: string;
  ruleEngineTriggered?: boolean;
  recommendedTechnicianId?: number;
  recommendedTechnicianName?: string;
  }

export interface FailureRequest {
  equipmentId: number;
  title: string;
  description: string;
  failureType?: string;
  reportedChannel?: string;
}

export interface FailureFilters {
  status?: FailureStatus;
  priority?: FailurePriority;
  equipmentId?: number;
}
