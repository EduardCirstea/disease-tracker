export interface Location {
    id: string;
    name: string;
    city: string;
    county: string;
    country: string;
    latitude: number;
    longitude: number;
    population?: number;
    populationDensity?: number;
  }
  
  // src/types/statistics.ts
  export interface StatisticsSummary {
    totalCases: number;
    casesByDisease: Array<{
      disease: string;
      count: string;
    }>;
    casesByStatus: Array<{
      status: CaseStatus;
      count: string;
    }>;
    topLocations: Array<{
      locationId: string;
      locationName: string;
      count: string;
    }>;
    recentCases: Array<{
      timeInterval: string;
      count: string;
    }>;
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
    timeInterval: string;
    count: number;
  }