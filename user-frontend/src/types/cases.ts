export enum CaseStatus {
    SUSPECTED = 'suspected',
    CONFIRMED = 'confirmed',
    RECOVERED = 'recovered',
    DECEASED = 'deceased',
  }
  
  export interface Case {
    id: string;
    patientId: string;
    age: number;
    gender: string;
    disease: string;
    symptoms: string[];
    diagnosisDate: string;
    status: CaseStatus;
    locationId: string;
    location?: Location;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }