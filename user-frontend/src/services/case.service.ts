import { Case } from '../types/case';

export const caseService = {
  async getCases(): Promise<Case[]> {
    const response = await fetch('/api/cases');
    if (!response.ok) {
      throw new Error('Failed to fetch cases');
    }
    return response.json();
  },

  async getCaseById(id: string): Promise<Case> {
    const response = await fetch(`/api/cases/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch case');
    }
    return response.json();
  },

  async createCase(caseData: Omit<Case, 'id'>): Promise<Case> {
    const response = await fetch('/api/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caseData),
    });
    if (!response.ok) {
      throw new Error('Failed to create case');
    }
    return response.json();
  },

  async updateCase(id: string, caseData: Partial<Case>): Promise<Case> {
    const response = await fetch(`/api/cases/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caseData),
    });
    if (!response.ok) {
      throw new Error('Failed to update case');
    }
    return response.json();
  },

  async deleteCase(id: string): Promise<void> {
    const response = await fetch(`/api/cases/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete case');
    }
  }
}; 