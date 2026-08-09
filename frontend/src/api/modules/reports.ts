import { request } from '../../utils/request';

export interface ReportSummary {
  companyName?: string;
  creditCode?: string;
  legalPerson?: string;
  establishDate?: string;
  industry?: string;
  registeredCapital?: string;
  shareholders?: Array<{ name: string; ratio?: number | string; subscribeAmount?: string }>;
  tycValid?: boolean;
  tycReasons?: string[];
  pptTitle?: string;
  pptSlidesCount?: number;
  excelSummary?: Record<string, any>;
  assignedTo?: string | null;
}

export interface Report {
  id: number;
  intakeId: number;
  pdfPath: string;
  pdfUrl: string;
  generatedBy: number;
  createdAt: string;
  summary?: ReportSummary | null;
}

export function getReport(intakeId: number) {
  return request<Report>({
    url: `/api/reports/${intakeId}`,
    method: 'get',
  });
}

export function getReportDownloadUrl(intakeId: number): string {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${base}/api/reports/${intakeId}/download`;
}

export function getReportPdfUrl(pdfUrl: string): string {
  if (pdfUrl.startsWith('http')) return pdfUrl;
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${base}${pdfUrl}`;
}
