export enum CaseStatus {
  SUSPECTED = 'suspected',
  CONFIRMED = 'confirmed',
  RECOVERED = 'recovered',
  DECEASED = 'deceased',
}

export interface Location {
  id: string;
  name: string;
  county: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface Case {
  id: string;
  disease: string;
  status: CaseStatus;
  diagnosisDate: string;
  location?: Location;
  patientAge?: number;
  patientGender?: 'MALE' | 'FEMALE' | 'OTHER';
  symptoms?: string[];
  notes?: string;
  lastUpdated: string;
} 