import axios from 'axios';
import { format, parseISO, isValid } from 'date-fns';
import { ro } from 'date-fns/locale';
import { 
  StatisticsSummary, 
  GeospatialDataPoint, 
  TimelineDataPoint,
  TimelineApiResponse 
} from '../types/statistics';
import { getAllCases } from './cases.service';
import { CaseStatus } from '../types/case';
import api from './api';

export const getSummary = async (): Promise<StatisticsSummary> => {
  const response = await api.get<StatisticsSummary>('/statistics/summary');
  return response.data;
};

export const getGeospatialStats = async (): Promise<GeospatialDataPoint[]> => {
  const response = await api.get<GeospatialDataPoint[]>('/statistics/geospatial');
  return response.data;
};

export const getTimelineStats = async (
  interval: 'day' | 'week' | 'month' = 'day',
  startDate?: string,
  endDate?: string
): Promise<TimelineDataPoint[]> => {
  const params = {
    interval,
    startDate,
    endDate,
  };
  
  const response = await api.get<TimelineDataPoint[]>('/statistics/timeline', { params });
  return response.data;
};

export const getDiseaseComparison = async (): Promise<any[]> => {
  const response = await api.get<any[]>('/statistics/diseases');
  return response.data;
};

export const getRegionalStats = async (): Promise<any[]> => {
  const response = await api.get<any[]>('/statistics/regional');
  return response.data;
};

export const getRecentTimelineStats = async (): Promise<TimelineDataPoint[]> => {
  try {
    const casesResponse = await getAllCases(1, 1000);
    const allCases = casesResponse.items;
    
    if (allCases.length === 0) {
      console.warn('Nu există cazuri în baza de date pentru a genera statistici timeline.');
      return [];
    }
    
    const casesByDate = allCases.reduce((acc: Record<string, number>, caseItem) => {
      // Verificăm dacă avem o dată validă înainte de a o procesa
      try {
        if (!caseItem.diagnosisDate) {
          console.warn('Caz fără dată de diagnosticare:', caseItem.id);
          return acc;
        }
        
        // Folosim metoda split pentru a obține doar partea cu data
        let dateOnly;
        if (typeof caseItem.diagnosisDate === 'string') {
          // Dacă e string, extragem direct data
          dateOnly = caseItem.diagnosisDate.split('T')[0];
        } else {
          // Altfel încercăm să convertim obiectul Date
          dateOnly = new Date(caseItem.diagnosisDate).toISOString().split('T')[0];
        }
        
        // Verificăm dacă am obținut o dată validă
        if (!dateOnly || dateOnly === 'Invalid Date') {
          console.warn('Dată invalidă pentru cazul:', caseItem.id);
          return acc;
        }
        
        if (!acc[dateOnly]) {
          acc[dateOnly] = 0;
        }
        
        acc[dateOnly]++;
      } catch (error) {
        console.warn('Eroare la procesarea datei pentru cazul:', caseItem.id, error);
      }
      
      return acc;
    }, {});
    
    const sortedDates = Object.keys(casesByDate).sort();
    
    const timelineData: TimelineDataPoint[] = sortedDates.map(date => ({
      date: date,
      count: casesByDate[date]
    }));
    
    return timelineData;
  } catch (error) {
    console.error('Eroare la obținerea statisticilor timeline din cazuri:', error);
    return [];
  }
};

// Funcție pentru obținerea datelor timeline anuale cu toți anii completați
export const getYearlyTimelineStats = async (): Promise<TimelineDataPoint[]> => {
  try {
    console.log('Generare timeline anual...');
    
    // Obținem toate cazurile pentru procesare locală
    const casesResponse = await getAllCases(1, 1000);
    const allCases = casesResponse.items;
    
    if (allCases.length === 0) {
      console.warn('Nu există cazuri în baza de date pentru a genera statistici anuale.');
      return [];
    }
    
    // Extragem anii din datele de diagnoză
    const years = allCases.map(caseItem => {
      try {
        const diagnosisDate = new Date(caseItem.diagnosisDate);
        if (isNaN(diagnosisDate.getTime())) {
          console.warn(`Dată invalidă pentru cazul ${caseItem.id}: ${caseItem.diagnosisDate}`);
          return null;
        }
        return diagnosisDate.getFullYear();
      } catch (error) {
        console.warn(`Eroare la procesarea datei pentru cazul ${caseItem.id}:`, error);
        return null;
      }
    }).filter(year => year !== null) as number[];
    
    if (years.length === 0) {
      console.warn('Nu s-au putut extrage ani valizi din datele de diagnoză.');
      return [];
    }
    
    // Găsim anul minim și maxim din cazurile existente
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    console.log(`Generăm timeline continuu pentru anii ${minYear} până la ${maxYear}`);
    
    // Inițializăm un obiect pentru a număra cazurile pe an
    const yearCounts: Record<number, number> = {};
    
    // Inițializăm toți anii cu 0 cazuri
    for (let year = minYear; year <= maxYear; year++) {
      yearCounts[year] = 0;
    }
    
    // Numărăm cazurile pentru fiecare an
    allCases.forEach(caseItem => {
      try {
        const diagnosisDate = new Date(caseItem.diagnosisDate);
        if (isNaN(diagnosisDate.getTime())) return;
        
        const year = diagnosisDate.getFullYear();
        if (year >= minYear && year <= maxYear) {
          yearCounts[year]++;
        }
      } catch (error) {
        console.warn('Eroare la procesarea unui caz:', error);
      }
    });
    
    // Convertim datele pentru grafic, asigurându-ne că includăm toți anii
    const timelineData: TimelineDataPoint[] = [];
    
    for (let year = minYear; year <= maxYear; year++) {
      timelineData.push({
        date: year.toString(),
        count: yearCounts[year] || 0
      });
    }
    
    console.log('Date timeline generate:', timelineData);
    
    return timelineData;
  } catch (error) {
    console.error('Eroare la obținerea statisticilor anuale:', error);
    return [];
  }
};

// Funcție pentru agregarea statisticilor pe boli în funcție de statusul cazurilor
export const getDiseasesStats = async (): Promise<any[]> => {
  try {
    // Obținem toate cazurile disponibile (maxim 1000 pentru performanță)
    const casesResponse = await getAllCases(1, 1000);
    const allCases = casesResponse.items;
    
    if (!allCases || allCases.length === 0) {
      console.warn('Nu există cazuri disponibile pentru a genera statistici pe boli.');
      return [];
    }
    
    console.log(`Am obținut ${allCases.length} cazuri pentru prelucrare`);
    
    // Creăm o mapă pentru a grupa cazurile după boală
    const diseaseMap: Record<string, {
      name: string;
      total: number;
      suspected: number;
      confirmed: number;
      recovered: number;
      deceased: number;
    }> = {};
    
    // Procesăm fiecare caz și îl adăugăm la statistici
    allCases.forEach(caseItem => {
      if (!caseItem.disease) {
        console.warn('Caz fără boală specificată:', caseItem.id);
        return;
      }
      
      const diseaseName = caseItem.disease.trim();
      const status = caseItem.status;
      
      // Inițializăm boala în mapă dacă nu există deja
      if (!diseaseMap[diseaseName]) {
        diseaseMap[diseaseName] = {
          name: diseaseName,
          total: 0,
          suspected: 0,
          confirmed: 0,
          recovered: 0,
          deceased: 0
        };
      }
      
      // Incrementăm numărul total de cazuri pentru boala respectivă
      diseaseMap[diseaseName].total++;
      
      // Incrementăm numărul de cazuri în funcție de status
      switch (status) {
        case CaseStatus.SUSPECTED:
          diseaseMap[diseaseName].suspected++;
          break;
        case CaseStatus.CONFIRMED:
          diseaseMap[diseaseName].confirmed++;
          break;
        case CaseStatus.RECOVERED:
          diseaseMap[diseaseName].recovered++;
          break;
        case CaseStatus.DECEASED:
          diseaseMap[diseaseName].deceased++;
          break;
        default:
          console.warn(`Status necunoscut pentru cazul ${caseItem.id}: ${status}`);
      }
    });
    
    // Convertim mapa într-un array pentru a fi returnat
    const result = Object.values(diseaseMap);
    
    // Sortăm bolile după numărul total de cazuri (descrescător)
    result.sort((a, b) => b.total - a.total);
    
    console.log(`Statistici generate pentru ${result.length} boli`);
    console.log('Exemplu statistici:', result.slice(0, 2));
    
    return result;
  } catch (error) {
    console.error('Eroare la agregarea statisticilor pe boli:', error);
    return [];
  }
};

// Funcție pentru exportul datelor în format CSV
export const exportDiseasesStatsToCSV = (diseaseStats: any[]): string => {
  if (!diseaseStats || diseaseStats.length === 0) {
    return '';
  }
  
  // Definim headerul CSV
  const headers = ['Boală', 'Total', 'Suspectate', 'Confirmate', 'Recuperate', 'Decedate'];
  
  // Transformăm datele în format CSV
  const csvRows = [
    headers.join(','), // Header row
    ...diseaseStats.map(disease => [
      `"${disease.name}"`, // Încapsulăm numele bolii în ghilimele pentru a gestiona virgulele
      disease.total,
      disease.suspected || 0,
      disease.confirmed || 0,
      disease.recovered || 0,
      disease.deceased || 0
    ].join(','))
  ];
  
  // Combinăm rândurile cu newline
  return csvRows.join('\n');
};

export const statisticsService = {
  async getGeospatialData(): Promise<GeospatialDataPoint[]> {
    const response = await fetch('/api/statistics/geospatial');
    if (!response.ok) {
      throw new Error('Failed to fetch geospatial data');
    }
    return response.json();
  },

  async getTimelineData(): Promise<TimelineDataPoint[]> {
    const response = await fetch('/api/statistics/timeline');
    if (!response.ok) {
      throw new Error('Failed to fetch timeline data');
    }
    return response.json();
  },

  async getSummaryData() {
    const response = await fetch('/api/statistics/summary');
    if (!response.ok) {
      throw new Error('Failed to fetch summary data');
    }
    return response.json();
  }
};

// Verificare date pentru vizibilitatea graficului
export const validateTimelineData = (data: TimelineDataPoint[]): boolean => {
  // Verifică dacă există date
  if (!data || data.length === 0) {
    return false;
  }
  
  // Verifică dacă există cel puțin o valoare diferită de zero
  return data.some(item => item.count > 0);
};

// Date mock pentru cazul în care API-ul eșuează
const mockTimelineResponse: TimelineApiResponse = {
  years: {
    "2019": 12,
    "2020": 45,
    "2021": 68,
    "2022": 32,
    "2023": 58
  }
};

export const getTimelineStatistics = async (): Promise<TimelineDataPoint[]> => {
  try {
    const response = await api.get<TimelineApiResponse>('/statistics/timeline');
    return processTimelineData(response.data);
  } catch (error) {
    console.error('Error fetching timeline statistics:', error);
    // Returnăm date simulate în caz de eroare
    return processTimelineData(mockTimelineResponse);
  }
};

// Funcție pentru procesarea datelor timeline pentru afișare corectă
const processTimelineData = (data: TimelineApiResponse): TimelineDataPoint[] => {
  if (!data || !data.years || Object.keys(data.years).length === 0) {
    return [];
  }

  // Sortăm anii în ordine cronologică
  const sortedYears = Object.keys(data.years)
    .map(year => parseInt(year, 10))
    .sort((a, b) => a - b);

  const result: TimelineDataPoint[] = [];

  // Procesăm fiecare an 
  for (let i = 0; i < sortedYears.length; i++) {
    const year = sortedYears[i];
    const count = data.years[year];
    
    // Adăugăm anul curent cu numărul de cazuri
    result.push({
      date: year.toString(),
      count
    });
    
    // Verificăm dacă trebuie să adăugăm un separator pentru ani nereprezentativi
    if (i < sortedYears.length - 1) {
      const nextYear = sortedYears[i + 1];
      const yearGap = nextYear - year;
      
      // Dacă diferența este exact 1 an, nu facem nimic
      if (yearGap === 1) {
        continue;
      }
      
      // Dacă diferența este 2-3 ani, adăugăm anii intermediari cu valoarea 0
      else if (yearGap <= 3) {
        for (let j = 1; j < yearGap; j++) {
          result.push({
            date: (year + j).toString(),
            count: 0
          });
        }
      }
      // Dacă diferența este mai mare de 3 ani, adăugăm un separator
      else {
        result.push({
          date: '', // Separator gol pentru întrerupere vizuală
          count: null as unknown as number // Utilizăm null pentru a nu afișa punctul
        });
      }
    }
  }
  
  return result;
};

/**
 * Obține statistici lunare pentru un an specificat
 * @param year Anul pentru care se doresc statisticile
 */
export const getMonthlyStatsByYear = async (year: number): Promise<TimelineDataPoint[]> => {
  try {
    console.log(`Generare statistici lunare pentru anul ${year}...`);
    
    // Obținem toate cazurile pentru procesare locală
    const casesResponse = await getAllCases(1, 1000);
    const allCases = casesResponse.items;
    
    if (!allCases || allCases.length === 0) {
      console.warn('Nu există cazuri disponibile pentru a genera statistici lunare.');
      return [];
    }
    
    // Inițializăm array-ul cu toate lunile din an (cu 0 cazuri inițial)
    const monthlyData: TimelineDataPoint[] = [];
    const monthNames = [
      'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 
      'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
    ];
    
    // Inițializăm datele pentru toate lunile anului cu 0 cazuri
    for (let month = 0; month < 12; month++) {
      monthlyData.push({
        date: monthNames[month],
        count: 0
      });
    }
    
    // Procesăm cazurile pentru anul specificat și incrementăm contoarele lunare
    allCases.forEach(caseItem => {
      try {
        if (!caseItem.diagnosisDate) return;
        
        const diagnosisDate = new Date(caseItem.diagnosisDate);
        
        if (isNaN(diagnosisDate.getTime())) {
          console.warn(`Dată invalidă pentru cazul ${caseItem.id}: ${caseItem.diagnosisDate}`);
          return;
        }
        
        const caseYear = diagnosisDate.getFullYear();
        const caseMonth = diagnosisDate.getMonth();
        
        // Verificăm dacă cazul este din anul solicitat
        if (caseYear === year) {
          // Incrementăm numărul de cazuri pentru luna respectivă
          monthlyData[caseMonth].count++;
        }
      } catch (error) {
        console.warn('Eroare la procesarea unui caz:', error);
      }
    });
    
    console.log(`Statistici lunare generate pentru anul ${year}:`, monthlyData);
    
    return monthlyData;
  } catch (error) {
    console.error(`Eroare la obținerea statisticilor lunare pentru anul ${year}:`, error);
    return [];
  }
};

/**
 * Obține anii disponibili din toate cazurile pentru selectare
 */
export const getAvailableYears = async (): Promise<number[]> => {
  try {
    // Folosim anul curent și anii din interval
    const currentYear = new Date().getFullYear();
    const startYear = 2000; // Începem din 2000
    
    // Generăm toți anii din interval
    const years: number[] = [];
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }
    
    return years;
  } catch (error) {
    console.error('Eroare la obținerea anilor disponibili:', error);
    return [new Date().getFullYear()]; // Returnăm doar anul curent în caz de eroare
  }
};