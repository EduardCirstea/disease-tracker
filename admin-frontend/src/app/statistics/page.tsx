'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { FiAlertCircle, FiCheckCircle, FiHeart, FiXCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { getSummary, getDiseasesStats, getYearlyTimelineStats } from '@/services/statistics.service';
import { CaseStatus } from '@/types/case';

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [diseaseStats, setDiseaseStats] = useState<any[]>([]);
  const [timeInterval, setTimeInterval] = useState<'year'>('year');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const COLORS = ['#F59E0B', '#EF4444', '#10B981', '#6B7280', '#8884D8'];
  const STATUS_COLORS = {
    [CaseStatus.SUSPECTED]: '#F59E0B',  // Galben
    [CaseStatus.CONFIRMED]: '#EF4444',  // Roșu
    [CaseStatus.RECOVERED]: '#10B981',  // Verde
    [CaseStatus.DECEASED]: '#6B7280',   // Gri
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Pentru vederea anuală folosim noua funcție
        const timelineResult = await getYearlyTimelineStats();
        
        const [summaryData, diseaseStatsData] = await Promise.all([
          getSummary(),
          getDiseasesStats()
        ]);
        
        console.log("Date primite - Summary:", summaryData);
        console.log("Date primite - Timeline:", timelineResult);
        console.log("Date primite - Diseases:", diseaseStatsData);
        
        setSummary(summaryData);
        setTimelineData(timelineResult);
        setDiseaseStats(diseaseStatsData);
      } catch (error) {
        console.error('Error fetching statistics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTimelineData = (data: any[]) => {
    return data.map(item => ({
      date: item.timeInterval,
      cases: parseInt(item.count, 10)
    }));
  };

  // Formatăm datele pentru graficul cu distribuția cazurilor
  const formatStatusData = () => {
    if (!summary?.casesByStatus || summary.casesByStatus.length === 0) {
      return [];
    }
    
    return summary.casesByStatus.map((item: any) => ({
      name: item.status,
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

  // Calculăm numărul total de pagini pentru paginare
  const totalPages = Math.ceil(diseaseStats.length / itemsPerPage);

  // Obținem elementele pentru pagina curentă
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return diseaseStats.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Funcții pentru navigarea paginilor
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generăm butoanele pentru paginare
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    // Buton pentru prima pagină
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => goToPage(1)}
          className="px-3 py-1 rounded-md text-sm hover:bg-gray-200 focus:outline-none"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        buttons.push(
          <span key="dots-start" className="px-3 py-1">...</span>
        );
      }
    }
    
    // Butoane pentru paginile vizibile
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded-md text-sm focus:outline-none ${
            currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Buton pentru ultima pagină
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots-end" className="px-3 py-1">...</span>
        );
      }
      
      buttons.push(
        <button
          key="last"
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 rounded-md text-sm hover:bg-gray-200 focus:outline-none"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  // Verificăm dacă avem date pentru grafice
  const hasTimelineData = timelineData && timelineData.length > 0;
  const hasStatusData = summary?.casesByStatus && summary.casesByStatus.length > 0;
  const hasLocationData = summary?.topLocations && summary.topLocations.length > 0;
  const hasDiseaseStats = diseaseStats && diseaseStats.length > 0;

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Statistici</h1>
          
          <div className="flex space-x-2">
            <button 
              className="px-4 py-2 rounded bg-blue-500 text-white"
            >
              Anual
            </button>
          </div>
        </div>

        {/* Grafic principal: evoluția cazurilor în timp */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Evoluția Cazurilor în Timp</h2>
          <div className="h-80">
            {hasTimelineData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={formatTimelineData(timelineData)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke="#3B82F6"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Nu există date disponibile</p>
              </div>
            )}
          </div>
        </div>

        {/* Grafice secundare */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuția cazurilor după status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Distribuția Cazurilor după Status</h2>
            <div className="h-80">
              {hasStatusData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatStatusData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {formatStatusData().map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.name as CaseStatus] || COLORS[index % COLORS.length]} 
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

          {/* Top locații afectate */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Locații Afectate</h2>
            <div className="h-80">
              {hasLocationData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary?.topLocations || []}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="locationName" 
                      type="category" 
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3B82F6" name="Cazuri" />
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

        {/* Tabel cu statistici pe boli */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Statistici pe Boli</h2>
            {hasDiseaseStats && totalPages > 1 && (
              <div className="text-sm text-gray-500">
                Afișez {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, diseaseStats.length)} din {diseaseStats.length} boli
              </div>
            )}
          </div>
          
          {hasDiseaseStats ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Boală
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Cazuri
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Suspectate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confirmate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recuperate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Decedate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getCurrentItems().map((disease: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {disease.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {disease.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {disease.suspected || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {disease.confirmed || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {disease.recovered || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {disease.deceased || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Paginare */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Pagina anterioară</span>
                      <FiChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {renderPaginationButtons()}
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Pagina următoare</span>
                      <FiChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500">Nu există date disponibile</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 