import React, { useState, useEffect } from 'react';
import { getAllLocationsList } from '../../services/locations.service';
import { predictOutbreak } from '../../services/predictions.service';
import { Location } from '../../types/location';
import { OutbreakPredictionParams, OutbreakPrediction } from '../../types/prediction';

interface OutbreakPredictionFormProps {
  onPredictionResult: (result: OutbreakPrediction) => void;
}

const OutbreakPredictionForm: React.FC<OutbreakPredictionFormProps> = ({ onPredictionResult }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [params, setParams] = useState<OutbreakPredictionParams>({
    locationId: '',
    previousPeriodDays: 30
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await getAllLocationsList();
        setLocations(locationsData);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('Nu s-au putut încărca locațiile. Vă rugăm să încercați din nou mai târziu.');
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'previousPeriodDays') {
      setParams(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setParams(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!params.locationId) {
      setError('Vă rugăm să selectați o locație');
      return;
    }
    
    try {
      setLoading(true);
      const result = await predictOutbreak(params);
      onPredictionResult(result);
    } catch (error) {
      console.error('Error predicting outbreak:', error);
      setError('Eroare la generarea predicției. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Predicție Focare</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-1">
            Locație
          </label>
          <select
            id="locationId"
            name="locationId"
            value={params.locationId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !params.locationId && error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selectați locația</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}, {location.city}, {location.county}
              </option>
            ))}
          </select>
          {!params.locationId && error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="previousPeriodDays" className="block text-sm font-medium text-gray-700 mb-1">
            Perioada anterioară de analiză (zile)
          </label>
          <input
            type="number"
            id="previousPeriodDays"
            name="previousPeriodDays"
            value={params.previousPeriodDays}
            onChange={handleChange}
            min="7"
            max="90"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Perioada de timp din trecut utilizată pentru a analiza tendințele și a genera predicția.
          </p>
        </div>
        
        {error && params.locationId && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading || !locations.length}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Se procesează...' : 'Generează Predicție'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OutbreakPredictionForm;

// src/utils/date-utils.ts
/**
 * Funcție pentru formatarea datelor în formatul local
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Funcție care returnează data curentă în format ISO
 */
export const currentDateISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Funcție care returnează data de acum X zile în format ISO
 */
export const daysAgoISO = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};