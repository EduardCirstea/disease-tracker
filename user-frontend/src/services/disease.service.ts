export interface Disease {
  id: string;
  name: string;
  description: string;
  symptoms: string[];
  treatment: string;
  prevention: string;
}

export const diseaseService = {
  async getDiseases(): Promise<Disease[]> {
    const response = await fetch('/api/diseases');
    if (!response.ok) {
      throw new Error('Failed to fetch diseases');
    }
    return response.json();
  },

  async getDiseaseById(id: string): Promise<Disease> {
    const response = await fetch(`/api/diseases/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch disease');
    }
    return response.json();
  },

  async createDisease(diseaseData: Omit<Disease, 'id'>): Promise<Disease> {
    const response = await fetch('/api/diseases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diseaseData),
    });
    if (!response.ok) {
      throw new Error('Failed to create disease');
    }
    return response.json();
  },

  async updateDisease(id: string, diseaseData: Partial<Disease>): Promise<Disease> {
    const response = await fetch(`/api/diseases/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diseaseData),
    });
    if (!response.ok) {
      throw new Error('Failed to update disease');
    }
    return response.json();
  },

  async deleteDisease(id: string): Promise<void> {
    const response = await fetch(`/api/diseases/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete disease');
    }
  }
}; 