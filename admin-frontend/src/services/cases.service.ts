import api from './api';
import { Case, CaseStatus } from '../types/case';
import { Location } from '../types/location';

interface CasesResponse {
  items: Case[];
  total: number;
}

export const getAllCases = async (
  page = 1,
  limit = 10,
  filters?: { 
    disease?: string; 
    status?: CaseStatus; 
    startDate?: string; 
    endDate?: string 
  }
): Promise<CasesResponse> => {
  const skip = (page - 1) * limit;
  
  const params = {
    skip,
    take: limit,
    ...filters,
  };
  
  const response = await api.get<[Case[], number]>('/admin/cases', { params });
  const [data, count] = response.data;
  
  return {
    items: data,
    total: count,
  };
};

export const getCaseById = async (id: string): Promise<Case> => {
  const response = await api.get<Case>(`/admin/cases/${id}`);
  return response.data;
};

export interface CreateCaseDto {
  patientId: string;
  age: number;
  gender: string;
  disease: string;
  symptoms: string[];
  diagnosisDate: string;
  status: CaseStatus;
  locationId: string;
  notes?: string;
}

export const createCase = async (caseData: CreateCaseDto): Promise<Case> => {
  const response = await api.post<Case>('/admin/cases', caseData);
  return response.data;
};

export const updateCase = async (id: string, caseData: Partial<Case>): Promise<Case> => {
  const response = await api.patch<Case>(`/admin/cases/${id}`, caseData);
  return response.data;
};

export const deleteCase = async (id: string): Promise<void> => {
  await api.delete(`/admin/cases/${id}`);
};

export const getLocations = async (): Promise<Location[]> => {
  const response = await api.get<Location[]>('/locations/all');
  return response.data;
};