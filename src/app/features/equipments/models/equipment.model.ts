export type EquipmentStatus = 'Active' | 'Inactive' | 'Under_Maintenance';
export type CriticalityLevel = 'Low' | 'Medium' | 'High';
export type EquipmentZone = 'Assemblage' | 'Préparation';

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
  area?: string;
  plant?: string;
  installationDate?: string;
  commissioningDate?: string;
  status: EquipmentStatus;
  criticalityLevel: CriticalityLevel;
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
  area?: string;
  plant?: string;
  installationDate?: string;
  commissioningDate?: string;
  status: EquipmentStatus;
  criticalityLevel: CriticalityLevel;
  notes?: string;
}

export interface EquipmentFilters {
  status?: EquipmentStatus;
  type?: string;
  criticality?: CriticalityLevel;
  search?: string;
}

export interface EquipmentImportResult {
  createdCount: number;
  skippedCount: number;
  errors: string[];
}

// ── Zones et Areas correspondantes (Assemblage 1-4, Préparation 1-6) ──
export const AREA_OPTIONS_BY_ZONE: Record<EquipmentZone, string[]> = {
  'Assemblage': ['Assemblage 1', 'Assemblage 2', 'Assemblage 3', 'Assemblage 4'],
  'Préparation': ['Préparation 1', 'Préparation 2', 'Préparation 3', 'Préparation 4', 'Préparation 5', 'Préparation 6']
};