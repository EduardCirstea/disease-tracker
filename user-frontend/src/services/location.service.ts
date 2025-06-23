import { Location } from '../types/case';

export const locationService = {
  async getLocations(): Promise<Location[]> {
    const response = await fetch('/api/locations');
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    return response.json();
  },

  async getLocationById(id: string): Promise<Location> {
    const response = await fetch(`/api/locations/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    return response.json();
  },

  async createLocation(locationData: Omit<Location, 'id'>): Promise<Location> {
    const response = await fetch('/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });
    if (!response.ok) {
      throw new Error('Failed to create location');
    }
    return response.json();
  },

  async updateLocation(id: string, locationData: Partial<Location>): Promise<Location> {
    const response = await fetch(`/api/locations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });
    if (!response.ok) {
      throw new Error('Failed to update location');
    }
    return response.json();
  },

  async deleteLocation(id: string): Promise<void> {
    const response = await fetch(`/api/locations/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete location');
    }
  }
}; 