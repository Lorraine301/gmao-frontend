export type EquipmentStatus = 'Active' | 'Inactive' | 'Under_Maintenance';
export type CriticalityLevel = 'Low' | 'Medium' | 'High';

export interface Equipment {
  id: number;
  code: string;
  name: string;
  description?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  type?: string;
  category?: string;
  plant?: string;
  productionLine?: string;
  location?: string;
  installationDate?: string;
  commissioningDate?: string;
  status: EquipmentStatus;
  criticalityLevel: CriticalityLevel;
  maintenanceTeam?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentRequest {
  code: string;
  name: string;
  description?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  type?: string;
  category?: string;
  plant?: string;
  productionLine?: string;
  location?: string;
  installationDate?: string;
  commissioningDate?: string;
  status: EquipmentStatus;
  criticalityLevel: CriticalityLevel;
  maintenanceTeam?: string;
  notes?: string;
}

export interface EquipmentFilters {
  status?: EquipmentStatus;
  type?: string;
  criticality?: CriticalityLevel;
  search?: string;
}