import api from './api';
import { StatisticsSummary, TimelineDataPoint } from '../types/statistics';
import { mockSummaryData, mockTimelineData } from '@/mock/statistics.mock';
import { getAllCases } from './cases.service';
import { Case, CaseStatus } from '@/types/case';

export const getSummary = async (): Promise<StatisticsSummary> => {
  try {
    const response = await api.get<StatisticsSummary>('/statistics/summary');
    
    // Verifică dacă datele sunt complete
    if (
      !response.data || 
      !response.data.casesByStatus || 
      response.data.casesByStatus.length === 0 || 
      !response.data.topLocations
    ) {
      console.warn('API a returnat date incomplete. Se folosesc date mock.');
      return mockSummaryData;
    }
    
    // Verifică dacă casesByDisease este prezent și populat
    if (!response.data.casesByDisease || response.data.casesByDisease.length === 0) {
      console.warn('API a returnat date despre boli incomplete. Se folosesc date mock pentru boli.');
      
      // Copiem răspunsul și adăugăm doar datele despre boli din mock
      return {
        ...response.data,
        casesByDisease: mockSummaryData.casesByDisease
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea datelor de rezumat:', error);
    return mockSummaryData;
  }
};

export const getGeospatialStats = async (): Promise<any> => {
  try {
    const response = await api.get('/statistics/geospatial');
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea datelor geospațiale:', error);
    return [];
  }
};

export const getTimelineStats = async (
  interval: 'day' | 'week' | 'month' | 'year' = 'year'
): Promise<TimelineDataPoint[]> => {
  try {
    const response = await api.get<TimelineDataPoint[]>(`/statistics/timeline?interval=${interval}`);
    
    // Verifică dacă avem date valide
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn('API a returnat date de timeline incomplete. Se folosesc date mock.');
      return mockTimelineData;
    }
    
    // Dacă am cerut date pe ani dar API-ul nu suportă,
    // sau dacă datele nu par să fie pe ani, folosim datele mock
    if (
      interval === 'year' && 
      (response.data[0]?.timeInterval?.includes('-') || 
       response.data[0]?.timeInterval?.length !== 4)
    ) {
      console.warn('API-ul nu suportă date pe ani. Se folosesc date mock.');
      return mockTimelineData;
    }
    
    return response.data;
  } catch (error) {
    console.error('Eroare la obținerea datelor de timeline:', error);
    return mockTimelineData;
  }
};

// Funcție pentru obținerea datelor reale grupate pe luni pentru un an specific
export const getCasesByMonthForYear = async (year: number): Promise<TimelineDataPoint[]> => {
  try {
    // Obținem toate cazurile (limita mare pentru a lua toate cazurile disponibile)
    const casesResponse = await getAllCases(1, 1000);
    const allCases = casesResponse.items;
    
    // Filtrăm cazurile pentru anul specificat
    const casesForYear = allCases.filter(caseItem => {
      // Folosim data de diagnoză pentru comparație
      const diagnosisDate = new Date(caseItem.diagnosisDate);
      return diagnosisDate.getFullYear() === year;
    });
    
    console.log(`Cazuri găsite pentru anul ${year}:`, casesForYear.length);
    
    // Inițializăm array-ul de luni (1-12)
    const monthsData: TimelineDataPoint[] = Array.from({ length: 12 }, (_, index) => ({
      timeInterval: getMonthName(index + 1),
      count: '0'
    }));
    
    // Grupăm cazurile pe luni
    casesForYear.forEach(caseItem => {
      const diagnosisDate = new Date(caseItem.diagnosisDate);
      const month = diagnosisDate.getMonth(); // 0-11
      
      // Incrementăm numărul de cazuri pentru luna respectivă
      const currentCount = parseInt(monthsData[month].count, 10);
      monthsData[month].count = (currentCount + 1).toString();
    });
    
    return monthsData;
  } catch (error) {
    console.error('Eroare la obținerea cazurilor pentru anul specificat:', error);
    
    // Returnăm un array gol de luni în caz de eroare
    return Array.from({ length: 12 }, (_, index) => ({
      timeInterval: getMonthName(index + 1),
      count: '0'
    }));
  }
};

// Funcție helper pentru a obține numele lunii în română
function getMonthName(monthNumber: number): string {
  const monthNames = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];
  
  return monthNames[monthNumber - 1]; // Ajustăm pentru indexarea 1-12
}

// Funcție pentru a obține lista anilor disponibili din cazuri
export const getAvailableYears = async (): Promise<number[]> => {
  try {
    // Obținem toate cazurile (limită mare pentru a lua toate cazurile disponibile)
    const casesResponse = await getAllCases(1, 1000);
    const allCases = casesResponse.items;
    
    // Extragem anii din datele de diagnoză
    const years = allCases.map(caseItem => {
      const diagnosisDate = new Date(caseItem.diagnosisDate);
      return diagnosisDate.getFullYear();
    });
    
    // Eliminăm duplicatele și sortăm anii
    const uniqueYears = [...new Set(years)].sort();
    
    // Dacă nu avem ani, adăugăm anul curent
    if (uniqueYears.length === 0) {
      uniqueYears.push(new Date().getFullYear());
    }
    
    return uniqueYears;
  } catch (error) {
    console.error('Eroare la obținerea anilor disponibili:', error);
    
    // Returnăm anul curent în caz de eroare
    return [new Date().getFullYear()];
  }
};

// Funcție pentru agregarea statisticilor pe boli în funcție de statusul cazurilor
export const getDiseasesStats = async (): Promise<any[]> => {
  try {
    // Obținem toate cazurile
    const casesResponse = await getAllCases(1, 1000);
    const allCases = casesResponse.items;
    
    // Creăm o mapă pentru a grupa cazurile după boală
    const diseaseMap: Record<string, {
      name: string;
      total: number;
      suspected: number;
      confirmed: number;
      recovered: number;
      deceased: number;
    }> = {};
    
    // Procesăm fiecare caz
    allCases.forEach(caseItem => {
      const { disease, status } = caseItem;
      
      // Inițializăm boala în mapă dacă nu există deja
      if (!diseaseMap[disease]) {
        diseaseMap[disease] = {
          name: disease,
          total: 0,
          suspected: 0,
          confirmed: 0,
          recovered: 0,
          deceased: 0
        };
      }
      
      // Incrementăm numărul total de cazuri pentru boala respectivă
      diseaseMap[disease].total++;
      
      // Incrementăm numărul de cazuri în funcție de status
      switch (status) {
        case CaseStatus.SUSPECTED:
          diseaseMap[disease].suspected++;
          break;
        case CaseStatus.CONFIRMED:
          diseaseMap[disease].confirmed++;
          break;
        case CaseStatus.RECOVERED:
          diseaseMap[disease].recovered++;
          break;
        case CaseStatus.DECEASED:
          diseaseMap[disease].deceased++;
          break;
      }
    });
    
    // Convertim mapa într-un array pentru a fi returnat
    return Object.values(diseaseMap);
  } catch (error) {
    console.error('Eroare la agregarea statisticilor pe boli:', error);
    return [];
  }
};

// Funcție pentru obținerea datelor timeline anuale cu toți anii completați, inclusiv cei fără cazuri
export const getYearlyTimelineStats = async (): Promise<TimelineDataPoint[]> => {
  try {
    // Obținem toate cazurile
    const casesResponse = await getAllCases(1, 1000);
    const allCases = casesResponse.items;
    
    if (allCases.length === 0) {
      console.warn('Nu există cazuri în baza de date pentru a genera statistici anuale.');
      return [];
    }
    
    // Extragem anii din datele de diagnoză
    const years = allCases.map(caseItem => {
      const diagnosisDate = new Date(caseItem.diagnosisDate);
      return diagnosisDate.getFullYear();
    });
    
    // Găsim anul minim și maxim
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    console.log(`Generăm timeline pentru anii ${minYear} până la ${maxYear}`);
    
    // Inițializăm un obiect pentru a număra cazurile pe an
    const yearCounts: Record<number, number> = {};
    
    // Inițializăm toți anii între minim și maxim cu 0 cazuri
    for (let year = minYear; year <= maxYear; year++) {
      yearCounts[year] = 0;
    }
    
    // Numărăm cazurile pentru fiecare an
    allCases.forEach(caseItem => {
      const diagnosisDate = new Date(caseItem.diagnosisDate);
      const year = diagnosisDate.getFullYear();
      yearCounts[year]++;
    });
    
    // Convertim în formatul așteptat de grafic
    const timelineData: TimelineDataPoint[] = Object.entries(yearCounts).map(([year, count]) => ({
      timeInterval: year,
      count: count.toString()
    }));
    
    console.log('Date generate pentru timeline anual:', timelineData);
    
    return timelineData;
  } catch (error) {
    console.error('Eroare la obținerea statisticilor anuale:', error);
    return [];
  }
};