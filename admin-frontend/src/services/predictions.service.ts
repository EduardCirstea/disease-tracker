import api from './api';
import { SimulationParams, SimulationResult, OutbreakPredictionParams } from '../types/prediction';

export const simulateSpread = async (params: SimulationParams): Promise<SimulationResult> => {
  const response = await api.post<SimulationResult>('/predictions/simulate', params);
  return response.data;
};

export const predictOutbreak = async (params: OutbreakPredictionParams): Promise<any> => {
  const response = await api.post('/predictions/outbreak', params);
  return response.data;
};