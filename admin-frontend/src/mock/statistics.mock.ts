import { StatisticsSummary, TimelineDataPoint } from '@/types/statistics';
import { CaseStatus } from '@/types/case';

// Date mock pentru rezumat statistici
export const mockSummaryData: StatisticsSummary = {
  totalCases: 42,
  casesByStatus: [
    { status: CaseStatus.CONFIRMED, count: '18' },
    { status: CaseStatus.SUSPECTED, count: '14' },
    { status: CaseStatus.RECOVERED, count: '8' },
    { status: CaseStatus.DECEASED, count: '2' }
  ],
  casesByDisease: [
    { disease: 'COVID-19', count: '15' },
    { disease: 'Gripă', count: '10' },
    { disease: 'Tuberculoză', count: '6' },
    { disease: 'Hepatită', count: '5' },
    { disease: 'Alte boli', count: '6' }
  ],
  topLocations: [
    { locationName: 'București', count: '12' },
    { locationName: 'Cluj-Napoca', count: '8' },
    { locationName: 'Iași', count: '6' },
    { locationName: 'Timișoara', count: '5' },
    { locationName: 'Brașov', count: '4' }
  ]
};

// Date mock pentru evoluția pe ani
export const mockTimelineData: TimelineDataPoint[] = [
  { timeInterval: '2018', count: '15' },
  { timeInterval: '2019', count: '24' },
  { timeInterval: '2020', count: '42' },
  { timeInterval: '2021', count: '38' },
  { timeInterval: '2022', count: '31' },
  { timeInterval: '2023', count: '27' },
  { timeInterval: '2024', count: '18' }
]; 