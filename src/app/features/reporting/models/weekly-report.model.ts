export interface WeeklyReport {
  id: number;
  weekNumber: number;
  totalFailures: number;
  resolvedFailures: number;
  averageRepairTime: number | null;
  criticalMachines: string | null;
  llmSummary: string | null;
  recommendations: string | null;
  generatedAt: string;
  generatedBy: string | null;
  pdfPath: string | null;
}