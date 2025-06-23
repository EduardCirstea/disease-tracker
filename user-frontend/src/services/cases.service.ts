import api from './api';
import { Case, CaseStatus } from '../types/case';

interface CasesResponse {
  items: Case[];
  total: number;
}

// Interfața pentru statistici detaliate pe boli
export interface DiseaseStatistics {
  name: string;
  total: number;
  suspected: number;
  confirmed: number;
  recovered: number;
  deceased: number;
}

export const getAllCases = async (
  page = 1,
  limit = 10,
  filters?: { 
    disease?: string; 
    status?: CaseStatus; 
    startDate?: string; 
    endDate?: string 
  }
): Promise<CasesResponse> => {
  const skip = (page - 1) * limit;
  
  const params = {
    skip,
    take: limit,
    ...filters,
  };
  
  try {
    console.log('Solicitarea de cazuri cu parametrii:', params);
    const response = await api.get('/cases', { params });
    console.log('Răspuns primit de la API:', response.data);
    
    // Verificăm dacă avem un răspuns valid și îl tratăm corespunzător
    if (response.data && Array.isArray(response.data) && response.data.length === 2) {
      // Formatul specific din backend [array_cazuri, total]
      const [items, total] = response.data;
      
      if (Array.isArray(items)) {
        console.log(`Preluat ${items.length} cazuri din ${total} disponibile`);
        return {
          items,
          total,
        };
      }
    } else if (response.data && Array.isArray(response.data.items)) {
      // Alt format posibil { items: [...], total: n }
      return {
        items: response.data.items,
        total: response.data.total || response.data.items.length,
      };
    } else if (Array.isArray(response.data)) {
      // Dacă răspunsul este direct un array simplu de cazuri
      return {
        items: response.data,
        total: response.data.length,
      };
    }
    
    // Dacă am ajuns aici, răspunsul nu are un format cunoscut
    console.warn('Răspunsul de la API nu are formatul așteptat:', response.data);
    return {
      items: [],
      total: 0,
    };
  } catch (error) {
    console.error('Eroare la obținerea cazurilor:', error);
    return {
      items: [],
      total: 0,
    };
  }
};

export const getCaseById = async (id: string): Promise<Case> => {
  const response = await api.get<Case>(`/cases/${id}`);
  return response.data;
};

export const getRecentCases = async (limit: number = 5): Promise<Case[]> => {
  const response = await api.get<Case[]>(`/cases/recent?limit=${limit}`);
  return response.data;
};

/**
 * Obține statistici detaliate pe boli cu distribuția cazurilor pe status
 */
export const getDiseaseStatistics = async (): Promise<DiseaseStatistics[]> => {
  try {
    console.log('Începem generarea statisticilor pe boli...');
    
    // Preluăm toate cazurile pentru prelucrare locală (maxim 1000)
    const allCases = await getAllCases(1, 1000);
    console.log(`Am obținut ${allCases.items.length} cazuri pentru prelucrare din total ${allCases.total}`);
    
    // Verificăm dacă avem date
    if (!allCases.items || allCases.items.length === 0) {
      console.warn('Nu există cazuri disponibile pentru a genera statistici.');
      return [];
    }
    
    // Afișăm primele câteva cazuri pentru verificare
    console.log('Primele 2 cazuri pentru verificare:', allCases.items.slice(0, 2));
    
    // Grupăm cazurile după boală și status
    const diseaseMap = new Map<string, DiseaseStatistics>();
    
    // Procesăm fiecare caz
    allCases.items.forEach((caseItem, index) => {
      if (!caseItem) {
        console.warn(`Cazul de la indexul ${index} este null sau undefined`);
        return;
      }
      
      if (!caseItem.disease) {
        console.warn(`Caz fără boală specificată (ID: ${caseItem.id || 'necunoscut'})`);
        return;
      }
      
      // Normalizăm numele bolii (trim și eliminăm spații multiple)
      const diseaseName = caseItem.disease.trim().replace(/\s+/g, ' ');
      
      // Adăugăm boala în map dacă nu există
      if (!diseaseMap.has(diseaseName)) {
        diseaseMap.set(diseaseName, {
          name: diseaseName,
          total: 0,
          suspected: 0,
          confirmed: 0,
          recovered: 0,
          deceased: 0
        });
      }
      
      // Actualizăm statisticile
      const stats = diseaseMap.get(diseaseName)!;
      stats.total++;
      
      // Verificăm tipul statusului
      if (!caseItem.status) {
        console.warn(`Caz fără status (ID: ${caseItem.id || 'necunoscut'})`);
        return;
      }
      
      // Ne asigurăm că avem un string pentru status
      const statusValue = typeof caseItem.status === 'string' 
        ? caseItem.status.toLowerCase() 
        : String(caseItem.status).toLowerCase();
      
      console.log(`Status pentru caz (ID: ${caseItem.id}): ${statusValue}, tip: ${typeof caseItem.status}`);
      
      // Incrementăm contorul pentru status
      if (statusValue === CaseStatus.SUSPECTED || statusValue === 'suspected') {
        stats.suspected++;
      } else if (statusValue === CaseStatus.CONFIRMED || statusValue === 'confirmed') {
        stats.confirmed++;
      } else if (statusValue === CaseStatus.RECOVERED || statusValue === 'recovered') {
        stats.recovered++;
      } else if (statusValue === CaseStatus.DECEASED || statusValue === 'deceased') {
        stats.deceased++;
      } else {
        console.warn(`Status necunoscut pentru caz (ID: ${caseItem.id}): "${statusValue}"`);
      }
    });
    
    // Verificăm dacă am generat vreun rezultat
    if (diseaseMap.size === 0) {
      console.warn('Nu am putut genera nicio statistică validă din cazurile disponibile');
      return [];
    }
    
    // Convertim Map în array și sortăm după numărul total de cazuri
    const result = Array.from(diseaseMap.values())
      .sort((a, b) => b.total - a.total);
    
    console.log(`Statistici generate pentru ${result.length} boli:`);
    console.log(result);
    
    return result;
  } catch (error) {
    console.error("Eroare la obținerea statisticilor pe boli:", error);
    return [];
  }
};
