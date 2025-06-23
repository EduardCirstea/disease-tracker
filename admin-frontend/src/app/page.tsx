'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { 
  FiUsers, 
  FiActivity, 
  FiMapPin, 
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiHeart,
  FiXCircle,
  FiCalendar
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import MainLayout from '@/components/layout/MainLayout';
import { getSummary, getTimelineStats, getCasesByMonthForYear, getAvailableYears } from '@/services/statistics.service';
import { StatisticsSummary, TimelineDataPoint } from '@/types/statistics';
import { CaseStatus } from '@/types/case';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<TimelineDataPoint[]>([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  
  const COLORS = ['#F59E0B', '#EF4444', '#10B981', '#6B7280', '#8884D8'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, years] = await Promise.all([
          getSummary(),
          getAvailableYears()
        ]);
        
        console.log('Date primite - Summary:', summaryData);
        console.log('Anii disponibili:', years);
        
        setSummary(summaryData);
        setAvailableYears(years);
        
        // Setăm anul curent sau ultimul an disponibil ca implicit
        if (years.length > 0) {
          const currentYear = new Date().getFullYear();
          const defaultYear = years.includes(currentYear) ? currentYear : years[years.length - 1];
          setSelectedYear(defaultYear);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Efect pentru încărcarea datelor lunare când se schimbă anul selectat
  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (!selectedYear) return;
      
      try {
        setLoadingMonthly(true);
        const data = await getCasesByMonthForYear(selectedYear);
        console.log(`Date lunare pentru anul ${selectedYear}:`, data);
        setMonthlyData(data);
      } catch (error) {
        console.error(`Eroare la obținerea datelor lunare pentru anul ${selectedYear}:`, error);
      } finally {
        setLoadingMonthly(false);
      }
    };

    fetchMonthlyData();
  }, [selectedYear]);

  // Funcție pentru a calcula tendința
  const calculateTrend = (data: TimelineDataPoint[]) => {
    if (data.length < 2) return 0;
    
    // Calculăm suma cazurilor pentru toate lunile disponibile
    const totalCurrentYear = data.reduce((sum, item) => sum + parseInt(item.count, 10), 0);
    
    // Vom folosi această cifră pentru a calcula tendința, dar pentru moment returnăm 0
    // În mod ideal, ar trebui să comparam cu anul anterior
    return 0;
  };

  const trend = monthlyData.length > 0 ? calculateTrend(monthlyData) : 0;

  // Funcție pentru formatarea datelor pentru graficul de evoluție lunară
  const formatMonthlyData = (data: TimelineDataPoint[]) => {
    return data.map(item => ({
      month: item.timeInterval,
      cazuri: parseInt(item.count, 10)
    }));
  };

  // Formatăm datele pentru graficul cu distribuția cazurilor
  const formatStatusData = () => {
    if (!summary?.casesByStatus || summary.casesByStatus.length === 0) {
      return [];
    }
    
    return summary.casesByStatus.map(item => ({
      name: item.status,
      value: parseInt(item.count, 10)
    }));
  };

  const getStatusColor = (status: CaseStatus): string => {
    switch (status) {
      case CaseStatus.SUSPECTED:
        return '#F59E0B'; // amber-500
      case CaseStatus.CONFIRMED:
        return '#EF4444'; // red-500
      case CaseStatus.RECOVERED:
        return '#10B981'; // green-500
      case CaseStatus.DECEASED:
        return '#6B7280'; // gray-500
      default:
        return '#6B7280';
    }
  };

  // Formatăm datele pentru graficul cu locații
  const formatLocationData = () => {
    if (!summary?.topLocations || summary.topLocations.length === 0) {
      return [];
    }
    
    return summary.topLocations.map(item => ({
      name: item.locationName,
      value: parseInt(item.count, 10)
    }));
  };

  const getStatusIcon = (status: CaseStatus): React.ReactNode => {
    switch (status) {
      case CaseStatus.SUSPECTED:
        return <FiAlertCircle className="text-amber-500" />;
      case CaseStatus.CONFIRMED:
        return <FiCheckCircle className="text-red-500" />;
      case CaseStatus.RECOVERED:
        return <FiHeart className="text-green-500" />;
      case CaseStatus.DECEASED:
        return <FiXCircle className="text-gray-500" />;
      default:
        return null;
    }
  };

  // Funcție pentru a gestiona schimbarea anului selectat
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10);
    setSelectedYear(year);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="spinner"></div>
        </div>
      </MainLayout>
    );
  }

  // Verificăm dacă avem date pentru grafice
  const hasMonthlyData = monthlyData && monthlyData.length > 0;
  const hasStatusData = summary?.casesByStatus && summary.casesByStatus.length > 0;
  const hasLocationData = summary?.topLocations && summary.topLocations.length > 0;

  return (
    <MainLayout>
      <Head>
        <title>Dashboard | Sistem Gestionare Boli Infecțioase</title>
      </Head>

      <div className="grid gap-6 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>

        {/* Carduri de statistici */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <FiUsers size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Cazuri</p>
                <p className="text-2xl font-semibold text-gray-800">{summary?.totalCases || 0}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {trend > 0 ? (
                <>
                  <FiTrendingUp className="text-red-500" />
                  <span className="text-red-500 text-sm ml-1">+{trend.toFixed(1)}%</span>
                </>
              ) : trend < 0 ? (
                <>
                  <FiTrendingUp className="text-green-500" />
                  <span className="text-green-500 text-sm ml-1">{trend.toFixed(1)}%</span>
                </>
              ) : (
                <span className="text-gray-500 text-sm ml-1">0%</span>
              )}
              <span className="text-gray-400 text-sm ml-2">față de anul precedent</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-500">
                <FiAlertCircle size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Cazuri Active</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {
                    summary?.casesByStatus.find(
                      item => item.status === CaseStatus.CONFIRMED
                    )?.count || 0
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <FiCheckCircle size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Recuperați</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {
                    summary?.casesByStatus.find(
                      item => item.status === CaseStatus.RECOVERED
                    )?.count || 0
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <FiMapPin size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Locații Afectate</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {summary?.topLocations.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grafic de evoluție a cazurilor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Evoluția Cazurilor pe Luni</h2>
              <div className="flex items-center">
                <FiCalendar className="mr-2 text-gray-500" />
                <select 
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-80">
              {loadingMonthly ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : hasMonthlyData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatMonthlyData(monthlyData)}
                    margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#4B5563' }} 
                      tickMargin={10}
                      axisLine={{ stroke: '#9CA3AF' }}
                      interval={0}
                      height={50}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fill: '#4B5563' }} 
                      axisLine={{ stroke: '#9CA3AF' }}
                      tickMargin={10}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} cazuri`, 'Total']} 
                      labelFormatter={(label) => `Luna ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.375rem',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      wrapperStyle={{ paddingTop: '10px' }} 
                    />
                    <Bar
                      dataKey="cazuri"
                      name="Cazuri înregistrate"
                      fill="#3B82F6"
                      barSize={20}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Nu există cazuri înregistrate pentru acest an</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Distribuția Cazurilor după Status</h2>
            <div className="h-72">
              {hasStatusData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatStatusData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {formatStatusData().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getStatusColor(entry.name as CaseStatus)} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} cazuri`, 'Total']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Nu există date disponibile</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top locații afectate */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">Top Locații Afectate</h2>
          <div className="h-72">
            {hasLocationData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formatLocationData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" name="Cazuri" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Nu există date disponibile</p>
              </div>
            )}
          </div>
        </div>
    </div>
    </MainLayout>
  );
}
