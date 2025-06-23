export enum SimulationModel {
    SIR = 'sir',
    SEIR = 'seir'
  }
  export interface SimulationParams {
    locationId: string;
    initialInfected: number;
    r0: number;
    recoveryRate: number;
    incubationRate?: number;
    days: number;
    model?: SimulationModel;
  }
  export interface SimulationDay {
    day: number;
    susceptible: number;
    exposed?: number;
    infected: number;
    recovered: number;
  }
  
  export interface SimulationResult {
    location: {
      id: string;
      name: string;
      population: number;
    };
    parameters: SimulationParams;
    results: SimulationDay[];
  }
  
  export interface OutbreakPredictionParams {
    locationId: string;
    previousPeriodDays?: number;
  }
  
  export interface ForecastData {
    date: string;
    predictedCases: number;
  }
  
  export interface OutbreakPrediction {
    location: {
      id: string;
      name: string;
    };
    historicalData: {
      periodStart: string;
      periodEnd: string;
      totalCases: number;
      growthRate: number;
      caseDensity: number;
    };
    prediction: {
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      confidence: number;
      forecast: ForecastData[];
    };
  }