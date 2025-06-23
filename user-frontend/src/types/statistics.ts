import { CaseStatus } from './case';

export interface StatusCount {
  status: CaseStatus;
  count: string;
}

export interface TimeIntervalCount {
  timeInterval: string;
  count: string;
}

export interface DiseaseCount {
  disease: string;
  count: string;
}

export interface LocationCount {
  name: string;
  count: string;
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

export interface TimelineDataPoint {
  date?: string;
  timeInterval?: string;
  count: number;
}

export interface StatisticsSummary {
  totalCases: number;
  casesByStatus: StatusCount[];
  recentCases: TimeIntervalCount[];
  casesByDisease: DiseaseCount[];
  topLocations: LocationCount[];
  lastUpdated: string;
}

export interface TimelineApiResponse {
  years: {
    [year: string]: number;
  };
} 