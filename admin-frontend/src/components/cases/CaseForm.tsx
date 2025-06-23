import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import { createCase, updateCase, getCaseById } from '../../services/cases.service';
import { getAllLocationsList } from '../../services/locations.service';
import { Case, CaseStatus } from '../../types/case';
import { Location } from '../../types/location';

interface CaseFormProps {
  caseId?: string;
  isEditMode?: boolean;
}

const CaseForm: React.FC<CaseFormProps> = ({ caseId, isEditMode = false }) => {
  const [formData, setFormData] = useState<Partial<Case>>({
    patientId: '',
    age: undefined,
    gender: '',
    disease: '',
    symptoms: [],
    diagnosisDate: new Date().toISOString().split('T')[0],
    status: CaseStatus.SUSPECTED,
    locationId: '',
    notes: '',
  });
  
  const [symptomInput, setSymptomInput] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await getAllLocationsList();
        setLocations(locationsData);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();

    // Încărcare caz pentru editare
    if (isEditMode && caseId) {
      const fetchCase = async () => {
        try {
          setLoading(true);
          const caseData = await getCaseById(caseId);
          
          // Formatare dată pentru input HTML
          const formattedDate = caseData.diagnosisDate 
            ? new Date(caseData.diagnosisDate).toISOString().split('T')[0]
            : '';
          
          setFormData({
            ...caseData,
            diagnosisDate: formattedDate,
          });
        } catch (error) {
          console.error('Error fetching case:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCase();
    }
  }, [isEditMode, caseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Curățare eroare pentru câmpul modificat
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : parseInt(value, 10),
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      const updatedSymptoms = [...(formData.symptoms || []), symptomInput.trim()];
      setFormData(prev => ({
        ...prev,
        symptoms: updatedSymptoms,
      }));
      setSymptomInput('');
    }
  };

  const removeSymptom = (index: number) => {
    const updatedSymptoms = [...(formData.symptoms || [])];
    updatedSymptoms.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      symptoms: updatedSymptoms,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.patientId?.trim()) {
      errors.patientId = 'ID-ul pacientului este obligatoriu';
    }
    
    if (formData.age === undefined || isNaN(Number(formData.age))) {
      errors.age = 'Vârsta trebuie să fie un număr';
    } else if (Number(formData.age) < 0 || Number(formData.age) > 120) {
      errors.age = 'Vârsta trebuie să fie între 0 și 120';
    }
    
    if (!formData.gender?.trim()) {
      errors.gender = 'Genul este obligatoriu';
    }
    
    if (!formData.disease?.trim()) {
      errors.disease = 'Boala este obligatorie';
    }
    
    if (!formData.symptoms || formData.symptoms.length === 0) {
      errors.symptoms = 'Trebuie adăugat cel puțin un simptom';
    }
    
    if (!formData.diagnosisDate) {
      errors.diagnosisDate = 'Data diagnosticării este obligatorie';
    }
    
    if (!formData.locationId) {
      errors.locationId = 'Locația este obligatorie';
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
      setSubmitting(true);
      
      if (isEditMode && caseId) {
        await updateCase(caseId, formData);
      } else {
        await createCase(formData as Omit<Case, 'id'>);
      }
      
      router.push('/cases');
    } catch (error) {
      console.error('Error saving case:', error);
      setFormErrors(prev => ({
        ...prev,
        submit: 'A apărut o eroare la salvare. Vă rugăm să încercați din nou.',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date pacient */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Date Pacient</h3>
            
            <div className="mb-4">
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                ID Pacient <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="patientId"
                name="patientId"
                value={formData.patientId || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.patientId ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.patientId && (
                <p className="mt-1 text-sm text-red-500">{formErrors.patientId}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Vârstă <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="0"
                max="120"
                value={formData.age === undefined ? '' : formData.age}
                onChange={handleNumberChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.age ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.age && (
                <p className="mt-1 text-sm text-red-500">{formErrors.age}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gen <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.gender ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selectați genul</option>
                <option value="M">Masculin</option>
                <option value="F">Feminin</option>
                <option value="Other">Altul</option>
              </select>
              {formErrors.gender && (
                <p className="mt-1 text-sm text-red-500">{formErrors.gender}</p>
              )}
            </div>
          </div>
          
          {/* Date diagnostic */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Date Diagnostic</h3>
            
            <div className="mb-4">
              <label htmlFor="disease" className="block text-sm font-medium text-gray-700 mb-1">
                Boală <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="disease"
                name="disease"
                value={formData.disease || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.disease ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.disease && (
                <p className="mt-1 text-sm text-red-500">{formErrors.disease}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                Simptome <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="symptoms"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="Adăugați un simptom"
                  className={`flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.symptoms ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSymptom();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addSymptom}
                  className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors"
                >
                  Adaugă
                </button>
              </div>
              {formErrors.symptoms && (
                <p className="mt-1 text-sm text-red-500">{formErrors.symptoms}</p>
              )}
              
              {formData.symptoms && formData.symptoms.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.symptoms.map((symptom, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      <span>{symptom}</span>
                      <button
                        type="button"
                        onClick={() => removeSymptom(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="diagnosisDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data Diagnosticării <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="diagnosisDate"
                name="diagnosisDate"
                value={formData.diagnosisDate || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.diagnosisDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.diagnosisDate && (
                <p className="mt-1 text-sm text-red-500">{formErrors.diagnosisDate}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || CaseStatus.SUSPECTED}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={CaseStatus.SUSPECTED}>Suspectat</option>
                <option value={CaseStatus.CONFIRMED}>Confirmat</option>
                <option value={CaseStatus.RECOVERED}>Recuperat</option>
                <option value={CaseStatus.DECEASED}>Decedat</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Secțiuni suplimentare */}
        <div className="mt-6">
          <div className="mb-4">
            <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-1">
              Locație <span className="text-red-500">*</span>
            </label>
            <select
              id="locationId"
              name="locationId"
              value={formData.locationId || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.locationId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selectați locația</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}, {location.city}, {location.county}
                </option>
              ))}
            </select>
            {formErrors.locationId && (
              <p className="mt-1 text-sm text-red-500">{formErrors.locationId}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Note adiționale
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {formErrors.submit && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {formErrors.submit}
          </div>
        )}
        
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Înapoi
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <FiSave className="mr-2" />
            {submitting ? 'Se salvează...' : isEditMode ? 'Actualizează' : 'Salvează'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseForm;