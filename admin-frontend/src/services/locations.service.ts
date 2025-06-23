import api from './api';
import { Location } from '../types/location';

interface LocationsResponse {
  items: Location[];
  total: number;
}

export const getAllLocations = async (
  page = 1,
  limit = 10,
  search?: string
): Promise<LocationsResponse> => {
  const skip = (page - 1) * limit;
  
  const params = {
    skip,
    take: limit,
    search,
  };
  
  const response = await api.get<[Location[], number]>('/admin/locations', { params });
  const [data, count] = response.data;
  
  return {
    items: data,
    total: count,
  };
};

export const getAllLocationsList = async (): Promise<Location[]> => {
  const response = await api.get<Location[]>('/locations/all');
  return response.data;
};

export const getLocationById = async (id: string): Promise<Location> => {
  const response = await api.get<Location>(`/admin/locations/${id}`);
  return response.data;
};

export const createLocation = async (locationData: Omit<Location, 'id'>): Promise<Location> => {
  const response = await api.post<Location>('/admin/locations', locationData);
  return response.data;
};

export const updateLocation = async (id: string, locationData: Partial<Location>): Promise<Location> => {
  const response = await api.patch<Location>(`/admin/locations/${id}`, locationData);
  return response.data;
};

export const deleteLocation = async (id: string): Promise<void> => {
  await api.delete(`/admin/locations/${id}`);
};
