import React, { useState, useEffect } from 'react';
import { getAllLocationsList } from '../../services/locations.service';
import { simulateSpread } from '../../services/predictions.service';
import { Location } from '../../types/location';
import { SimulationParams, SimulationResult, SimulationModel } from '../../types/prediction';

interface SimulationFormProps {
  onSimulationResult: (result: SimulationResult) => void;
}

const SimulationForm: React.FC<SimulationFormProps> = ({ onSimulationResult }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [params, setParams] = useState<SimulationParams>({
    locationId: '',
    initialInfected: 10,
    r0: 2.5,
    recoveryRate: 0.1,
    days: 100,
    model: SimulationModel.SIR
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await getAllLocationsList();
        // Filtrare locații care au populație
        const validLocations = locationsData.filter(loc => loc.population);
        setLocations(validLocations);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Valori numerice
    if (['initialInfected', 'days'].includes(name)) {
      setParams(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } 
    // Valori float
    else if (['r0', 'recoveryRate', 'incubationRate'].includes(name)) {
      setParams(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    }
    // Alte valori
    else {
      setParams(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Curățare eroare
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!params.locationId) {
      errors.locationId = 'Vă rugăm să selectați o locație';
    }
    
    if (params.initialInfected <= 0) {
      errors.initialInfected = 'Trebuie să fie un număr pozitiv';
    }
    
    if (params.r0 <= 0) {
      errors.r0 = 'R0 trebuie să fie pozitiv';
    }
    
    if (params.recoveryRate <= 0 || params.recoveryRate > 1) {
      errors.recoveryRate = 'Rata trebuie să fie între 0 și 1';
    }
    
    if (params.model === SimulationModel.SEIR && (!params.incubationRate || params.incubationRate <= 0 || params.incubationRate > 1)) {
      errors.incubationRate = 'Rata trebuie să fie între 0 și 1';
    }
    
    if (params.days < 1 || params.days > 365) {
      errors.days = 'Zilele trebuie să fie între 1 și 365';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const result = await simulateSpread(params);
      onSimulationResult(result);
    } catch (error) {
      console.error('Error running simulation:', error);
      setFormErrors(prev => ({
        ...prev,
        submit: 'Eroare la rularea simulării. Vă rugăm să încercați din nou.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Simulare Răspândire</h2>
      
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
              formErrors.locationId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selectați locația</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}, {location.city}, {location.county} (Pop: {location.population?.toLocaleString()})
              </option>
            ))}
          </select>
          {formErrors.locationId && (
            <p className="mt-1 text-sm text-red-500">{formErrors.locationId}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Model de simulare
          </label>
          <select
            id="model"
            name="model"
            value={params.model}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={SimulationModel.SIR}>SIR (Susceptible-Infected-Recovered)</option>
            <option value={SimulationModel.SEIR}>SEIR (Susceptible-Exposed-Infected-Recovered)</option>
          </select>
          {params.model === SimulationModel.SEIR && (
            <p className="mt-1 text-xs text-gray-500">
              *Modelul SEIR include o perioadă de incubație înainte ca indivizii expuși să devină infecțioși.
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="initialInfected" className="block text-sm font-medium text-gray-700 mb-1">
            Infectați inițial
          </label>
          <input
            type="number"
            id="initialInfected"
            name="initialInfected"
            value={params.initialInfected}
            onChange={handleChange}
            min="1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.initialInfected ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.initialInfected && (
            <p className="mt-1 text-sm text-red-500">{formErrors.initialInfected}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="r0" className="block text-sm font-medium text-gray-700 mb-1">
            R0 (Coeficient de transmisie de bază)
          </label>
          <input
            type="number"
            id="r0"
            name="r0"
            value={params.r0}
            onChange={handleChange}
            min="0.1"
            step="0.1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.r0 ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.r0 && (
            <p className="mt-1 text-sm text-red-500">{formErrors.r0}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            R0 reprezintă numărul mediu de infecții secundare produse de un individ infectat.
          </p>
        </div>
        
        {params.model === SimulationModel.SEIR && (
          <div className="mb-4">
            <label htmlFor="incubationRate" className="block text-sm font-medium text-gray-700 mb-1">
              Rata de incubație
            </label>
            <input
              type="number"
              id="incubationRate"
              name="incubationRate"
              value={params.incubationRate || ''}
              onChange={handleChange}
              min="0.01"
              max="1"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.incubationRate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.incubationRate && (
              <p className="mt-1 text-sm text-red-500">{formErrors.incubationRate}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Rata de tranziție de la expus la infectat (1/perioada de incubație medie).
            </p>
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="recoveryRate" className="block text-sm font-medium text-gray-700 mb-1">
            Rata de recuperare
          </label>
          <input
            type="number"
            id="recoveryRate"
            name="recoveryRate"
            value={params.recoveryRate}
            onChange={handleChange}
            min="0.01"
            max="1"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.recoveryRate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.recoveryRate && (
            <p className="mt-1 text-sm text-red-500">{formErrors.recoveryRate}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Rata de tranziție de la infectat la recuperat (1/perioada de infecțiozitate).
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
            Zile de simulat
          </label>
          <input
            type="number"
            id="days"
            name="days"
            value={params.days}
            onChange={handleChange}
            min="10"
            max="365"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.days ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.days && (
            <p className="mt-1 text-sm text-red-500">{formErrors.days}</p>
          )}
        </div>
        
        {formErrors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {formErrors.submit}
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Se procesează...' : 'Rulează Simulare'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimulationForm;