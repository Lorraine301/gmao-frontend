export interface SparePart {
  id: number;
  name: string;
  reference: string;
  supplier?: string;
  warehouseLocation?: string;
  quantity: number;
  minimumStock: number;
  unit?: string;
  unitPrice?: number;
  lowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SparePartRequest {
  name: string;
  reference: string;
  supplier?: string;
  warehouseLocation?: string;
  quantity: number;
  minimumStock: number;
  unit?: string;
  unitPrice?: number;
}

export interface ConsumeStockRequest {
  sparePartId: number;
  quantityUsed: number;
}

// ── Nouveau : historique de consommation ──────────────────
export type ConsumptionType = 'CORRECTIVE' | 'PREVENTIVE';

export interface PartConsumption {
  id: number;
  consumptionDate: string;
  sparePartName: string;
  sparePartReference: string;
  quantityUsed: number;
  unitPrice?: number;
  totalPrice?: number;
  consumptionType: ConsumptionType;
  technicianName?: string;
  equipmentCode?: string;
  equipmentName?: string;
}