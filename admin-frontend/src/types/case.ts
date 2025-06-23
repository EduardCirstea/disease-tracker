export enum CaseStatus {
    SUSPECTED = 'suspected',
    CONFIRMED = 'confirmed',
    RECOVERED = 'recovered',
    DECEASED = 'deceased',
}

interface Location {
    name: string;
    city: string;
    county: string;
    country: string;
}

export interface Case {
    id: string;
    patientId: string;
    age: number;
    gender: string;
    disease: string;
    status: CaseStatus;
    locationId: string;
    location: Location;
    locationName: string;
    dateOfOnset: string;
    dateOfDiagnosis: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    symptoms: string[];
    notes?: string;
    diagnosisDate: string;
    treatment: string;
}
  