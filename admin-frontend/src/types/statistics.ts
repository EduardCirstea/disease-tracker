import { CaseStatus } from './case';

export interface TimelineDataPoint {
  timeInterval: string;
  count: string;
}

export interface StatusCount {
  status: CaseStatus;
  count: string;
}

export interface DiseaseCount {
  disease: string;
  count: string;
}

export interface LocationCount {
  locationName: string;
  count: string;
}

export interface StatisticsSummary {
  totalCases: number;
  casesByStatus: StatusCount[];
  casesByDisease: DiseaseCount[];
  topLocations: LocationCount[];
}

export interface GeospatialDataPoint {
  id: string;
  name: string;
  city: string;
  county: string;
  latitude: number;
  longitude: number;
  count: number;
}