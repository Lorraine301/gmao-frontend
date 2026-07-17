export type AiAnalysisStatus = 'Pending' | 'Completed' | 'Failed';

export interface AiAnalysis {
  id: number;
  failureId: number;
  predictedCause: string | null;
  recommendedAction: string | null;
  riskLevel: string | null;
  summary: string | null;
  status: AiAnalysisStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}