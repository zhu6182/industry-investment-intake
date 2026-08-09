import { request } from '../../utils/request';

export type IntakeStatus =
  | 'pending'
  | 'rejected'
  | 'approved'
  | 'assigned'
  | 'following'
  | 'landed'
  | 'lost';

export type IntakeFileType = 'application' | 'ppt' | 'data_sheet' | 'photo';

export interface TycCompany {
  name: string;
  creditCode?: string;
  legalPerson?: string;
  establishDate?: string;
  status?: string;
  registeredCapital?: string;
  industry?: string;
  shareholders?: Array<{ name: string; ratio?: number | string; subscribeAmount?: string }>;
}

export interface RiskInfo {
  hasExecution: boolean;
  hasDishonesty: boolean;
  hasLawsuit: boolean;
  isRevoked: boolean;
  executionCount: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface RatingBreakdown {
  total: number;
  age: number;
  ageMax: number;
  registeredCapital: number;
  registeredCapitalMax: number;
  status: number;
  statusMax: number;
  risk: number;
  riskMax: number;
  industry: number;
  industryMax: number;
  tags: string[];
}

export interface TycValidation {
  isValid: boolean;
  reasons: string[];
  rating?: number;
  ratingBreakdown?: RatingBreakdown;
  risk?: RiskInfo;
  company: TycCompany;
  /** 数据来源: 'mcp' = 火山 Agent Plan MCP 真实数据 */
  source?: 'mcp';
  datasetType?: string;
  latencyMs?: number;
  message?: string;
}

export interface CompanyLookupResult extends TycValidation {
  exists: boolean;
  canProceed: boolean;
}

export function lookupCompany(companyName: string) {
  return request<CompanyLookupResult>({
    url: '/api/tyc/lookup',
    method: 'post',
    data: { name: companyName },
  });
}

export interface IntakeFile {
  id: number;
  type: IntakeFileType;
  originalName: string;
  storedName: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface Intake {
  id: number;
  companyName: string;
  creditCode?: string;
  legalPerson?: string;
  establishDate?: string;
  industry?: string;
  shareholders?: string;
  applicationRegionId?: number;
  area?: number;
  status: IntakeStatus;
  rejectReason?: string;
  tycValidation?: TycValidation;
  createdAt: string;
  updatedAt?: string;
  applicant?: { id: number; name: string; phone: string };
  assignedTo?: { id: number; name: string; phone: string };
  files?: IntakeFile[];
}

export interface CreateIntakeParams {
  companyName: string;
  creditCode?: string;
  legalPerson?: string;
  establishDate?: string;
  industry?: string;
  shareholders?: string;
  applicationRegionId?: number;
  area?: number;
}

export interface UpdateIntakeParams {
  companyName?: string;
  creditCode?: string;
  legalPerson?: string;
  establishDate?: string;
  industry?: string;
  shareholders?: string;
  applicationRegionId?: number;
  area?: number;
  status?: IntakeStatus;
  rejectReason?: string;
  assignedToId?: number;
}

export interface QueryIntakeParams {
  keyword?: string;
  status?: IntakeStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export type PaginatedIntakes = [Intake[], number];

export function createIntake(data: CreateIntakeParams) {
  return request<Intake>({
    url: '/api/intakes',
    method: 'post',
    data,
  });
}

export function listIntakes(params?: QueryIntakeParams) {
  return request<PaginatedIntakes>({
    url: '/api/intakes',
    method: 'get',
    params,
  });
}

export function getIntake(id: number) {
  return request<Intake>({
    url: `/api/intakes/${id}`,
    method: 'get',
  });
}

export function updateIntake(id: number, data: UpdateIntakeParams) {
  return request<Intake>({
    url: `/api/intakes/${id}`,
    method: 'patch',
    data,
  });
}

export interface IntakeCheckResult {
  exists: boolean;
  intakeId?: number;
  companyName?: string;
  status?: string;
  createdAt?: string;
  applicantName?: string;
  applicantPhone?: string;
  assignedToName?: string;
  assignedToPhone?: string;
}

export function checkIntakeExists(companyName: string) {
  return request<IntakeCheckResult>({
    url: '/api/intakes/check',
    method: 'post',
    data: { companyName },
  });
}

export function submitIntake(id: number) {
  return request<Intake>({
    url: `/api/intakes/${id}/submit`,
    method: 'post',
  });
}

export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<{ url: string; size: number; originalName: string; storedName: string; mimetype: string }>({
    url: '/api/upload/file',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export const statusMap: Record<IntakeStatus, { text: string; color: string }> = {
  pending: { text: '待审核', color: 'orange' },
  rejected: { text: '已驳回', color: 'red' },
  approved: { text: '已通过', color: 'blue' },
  assigned: { text: '已分配', color: 'cyan' },
  following: { text: '跟进中', color: 'processing' },
  landed: { text: '已落地', color: 'green' },
  lost: { text: '已流失', color: 'default' },
};
