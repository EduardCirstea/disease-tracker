'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { FiAlertCircle, FiCheckCircle, FiHeart, FiXCircle, FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi';
import MainLayout from '../../components/layout/MainLayout';
import { 
  getSummary, 
  getTimelineStats,
  getYearlyTimelineStats,
  validateTimelineData
} from '../../services/statistics.service';
import { getDiseaseStatistics, DiseaseStatistics } from '../../services/cases.service';
import { CaseStatus } from '../../types/case';

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [statusDistributionData, setStatusDistributionData] = useState<any[]>([]);
  const [locationsData, setLocationsData] = useState<any[]>([]);
  const [diseaseStats, setDiseaseStats] = useState<DiseaseStatistics[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Aceleași culori ca pe pagina principală pentru consistență
  const STATUS_COLORS: Record<string, string> = {
    'suspected': '#F59E0B',  // Galben pentru suspectate
    'confirmed': '#EF4444',  // Roșu pentru confirmate
    'recovered': '#10B981',  // Verde pentru recuperate
    'deceased': '#6B7280',   // Gri pentru decedate
  };
  
  const COLORS = ['#F59E0B', '#EF4444', '#10B981', '#6B7280', '#8884D8'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obținem toate datele necesare direct din API
        const summaryData = await getSummary();
        const timelineResult = await getYearlyTimelineStats();
        const diseaseStatsData = await getDiseaseStatistics();
        
        console.log("Date primite - Summary:", summaryData);
        console.log("Date primite - Timeline:", timelineResult);
        console.log("Date primite - Diseases:", diseaseStatsData);
        
        // Formatăm datele pentru graficul cu evoluția în timp
        // Timeline data are deja formatul corect cu date și count
        
        // Formatăm datele pentru distribuția de status
        const statusData = summaryData?.casesByStatus?.map((item: any) => ({
          name: item.status,
          value: parseInt(item.count, 10)
        })) || [];
        
        // Formatăm datele pentru locații
        const topLocations = summaryData?.topLocations?.map((item: any) => ({
          name: item.name || item.locationName,
          count: parseInt(item.count, 10)
        })) || [];
        
        // Setăm datele în state
        setSummary(summaryData);
        setTimelineData(timelineResult);
        setStatusDistributionData(statusData);
        setLocationsData(topLocations);
        setDiseaseStats(diseaseStatsData);
      } catch (error) {
        console.error('Eroare la obținerea datelor statistice:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Funcția pentru descărcarea statisticilor ca CSV
  const downloadCSV = () => {
    if (!diseaseStats || diseaseStats.length === 0) {
      alert('Nu există date disponibile pentru descărcare');
      return;
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
    const csvContent = csvRows.join('\n');
    
    // Creăm un blob și un link de descărcare
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `statistici_boli_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case 'suspected':
        return <FiAlertCircle className="text-amber-500" />;
      case 'confirmed':
        return <FiCheckCircle className="text-red-500" />;
      case 'recovered':
        return <FiHeart className="text-green-500" />;
      case 'deceased':
        return <FiXCircle className="text-gray-500" />;
      default:
        return null;
    }
  };

  // Paginare pentru tabelul de boli
  const totalPages = Math.ceil(diseaseStats.length / itemsPerPage);
  
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return diseaseStats.slice(indexOfFirstItem, indexOfLastItem);
  };

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

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 3;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md text-sm focus:outline-none ${
            currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return buttons;
  };

  if (loading) {
    return (
      <MainLayout title="Statistici | Monitorizare Boli Infecțioase">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  const hasTimelineData = validateTimelineData(timelineData);
  const hasStatusData = statusDistributionData && statusDistributionData.length > 0;
  const hasLocationData = locationsData && locationsData.length > 0;
  const hasDiseaseStats = diseaseStats && diseaseStats.length > 0;

  return (
    <MainLayout title="Statistici | Monitorizare Boli Infecțioase">
      <div className="bg-blue-700 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Statistici Boli Infecțioase</h1>
          <p className="mt-2">Vizualizare și analiză a datelor despre boli infecțioase</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cartonașe pentru numărul total de cazuri */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-1">Total Cazuri</h3>
            <p className="text-3xl font-bold text-blue-600">{summary?.totalCases || 0}</p>
          </div>
          
          {summary?.casesByStatus?.map((item: any) => {
            // Determinăm culorile și iconițele pentru fiecare status
            let color = '';
            let icon = null;
            
            switch(item.status) {
              case 'suspected':
                color = '#F59E0B';
                icon = <FiAlertCircle className="text-amber-500" />;
                break;
              case 'confirmed':
                color = '#EF4444';
                icon = <FiCheckCircle className="text-red-500" />;
                break;
              case 'recovered':
                color = '#10B981';
                icon = <FiHeart className="text-green-500" />;
                break;
              case 'deceased':
                color = '#6B7280';
                icon = <FiXCircle className="text-gray-500" />;
                break;
              default:
                color = '#3B82F6';
            }
            
            return (
              <div key={item.status} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-1">
                  {icon}
                  <h3 className="text-lg font-medium text-gray-700 ml-2">
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </h3>
                </div>
                <p className="text-3xl font-bold" style={{ color }}>
                  {item.count}
                </p>
              </div>
            );
          })}
        </div>

        {/* Grafic pentru evoluția în timp */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Evoluția Cazurilor în Timp</h2>
          
          {hasTimelineData ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timelineData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    padding={{ left: 30, right: 30 }}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value === '' ? '' : value}
                  />
                  <YAxis 
                    allowDecimals={false}
                    domain={[0, 'dataMax + 1']}
                    includeHidden={true}
                  />
                  <Tooltip 
                    filterNull={true}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length && label !== '') {
                        const count = payload[0].value;
                        return (
                          <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
                            <p className="font-medium">{`Anul ${label}`}</p>
                            <p className="text-blue-600 font-semibold">
                              {`${count} ${count === 1 ? 'caz' : 'cazuri'}`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Număr cazuri" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ r: 5, strokeWidth: 2 }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                    isAnimationActive={true}
                    animationDuration={1000}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nu există date disponibile pentru afișarea evoluției în timp</p>
            </div>
          )}
          
          {hasTimelineData && (
            <div className="mt-4 text-sm text-gray-600">
              <p>
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                Graficul afișează evoluția cazurilor pentru fiecare an. Perioadele fără cazuri apar cu valoarea zero.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Distribuția cazurilor după status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribuția Cazurilor după Status</h2>
            
            {hasStatusData ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} cazuri`, 'Număr']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nu există date disponibile pentru afișarea distribuției cazurilor</p>
              </div>
            )}
          </div>

          {/* Top locații afectate */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Locații Afectate</h2>
            
            {hasLocationData ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationsData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 12 }} 
                      width={100}
                    />
                    <Tooltip formatter={(value) => [`${value} cazuri`, 'Număr']} />
                    <Legend />
                    <Bar dataKey="count" name="Cazuri" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-60 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nu există date disponibile pentru afișarea locațiilor afectate</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabel cu statistici pe boli */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Statistici pe Boli</h2>
            <button 
              onClick={downloadCSV}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
            >
              <FiDownload className="mr-2" />
              Descarcă CSV
            </button>
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
                    {getCurrentItems().map((disease, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {disease.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                          {disease.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                            {disease.suspected || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                            {disease.confirmed || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                            {disease.recovered || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-gray-500 mr-2"></span>
                            {disease.deceased || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Paginare */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Afișare <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, diseaseStats.length)}-{Math.min(currentPage * itemsPerPage, diseaseStats.length)}</span> din <span className="font-medium">{diseaseStats.length}</span> boli
                  </div>
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
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nu există date disponibile pentru statistici pe boli</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                Datele statistice sunt actualizate în timp real pe baza informațiilor din sistemul de monitorizare.
                Pentru mai multe detalii sau rapoarte personalizate, descărcați datele în format CSV utilizând butonul de descărcare de mai sus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 