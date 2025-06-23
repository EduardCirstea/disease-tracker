"use client";

// src/pages/index.tsx
import React, { useEffect, useState } from 'react';
import { FiAlertCircle, FiPieChart, FiMap, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getSummary, getMonthlyStatsByYear, getAvailableYears } from '../services/statistics.service';
import { getRecentCases } from '../services/cases.service';
import { StatisticsSummary } from '../types/statistics';
import { Case, CaseStatus } from '../types/case';
import { formatDate, getStatusColor, getStatusBadgeClass } from '../utils/date-utils';

const Home: React.FC = () => {
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearLoading, setYearLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, recentCasesData, yearsData] = await Promise.all([
          getSummary(),
          getRecentCases(5),
          getAvailableYears()
        ]);
        
        setSummary(summaryData);
        setRecentCases(recentCasesData);
        setAvailableYears(yearsData);
        
        // Încarcă datele pentru anul curent
        const monthlyStats = await getMonthlyStatsByYear(selectedYear);
        setMonthlyData(monthlyStats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchYearData = async () => {
      try {
        setYearLoading(true);
        const monthlyStats = await getMonthlyStatsByYear(selectedYear);
        setMonthlyData(monthlyStats);
      } catch (error) {
        console.error(`Error fetching data for year ${selectedYear}:`, error);
      } finally {
        setYearLoading(false);
      }
    };

    fetchYearData();
  }, [selectedYear]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Culorile specifice pentru fiecare status
  const STATUS_COLORS: Record<string, string> = {
    'suspected': '#F59E0B',     // Galben pentru suspectate
    'confirmed': '#EF4444',     // Roșu pentru confirmate
    'recovered': '#10B981',     // Verde pentru recuperate
    'deceased': '#6B7280',      // Gri pentru decedate
  };
  
  // Preprocesarea datelor pentru grafice
  const prepareStatusData = () => {
    if (!summary) return [];
    
    return summary.casesByStatus.map(item => ({
      name: item.status,
      value: parseInt(item.count, 10)
    }));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  return (
    <MainLayout>
      <div className="bg-blue-700 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">
              Monitorizare Boli Infecțioase
            </h1>
            <p className="text-xl mb-6">
              Platformă completă pentru monitorizarea și vizualizarea cazurilor de boli infecțioase
            </p>
            <div className="flex space-x-4">
              <Link href="/statistics" passHref>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer"
                >
                  Vezi Statistici
                </Button>
              </Link>
              <Link href="/map" passHref>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-blue-600 bg-green-600 hover:bg-green-700 hover:cursor-pointer"
                >
                  Vezi Harta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Carduri rapide cu statistici */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                    <FiAlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Cazuri</p>
                    <p className="text-2xl font-semibold">{summary?.totalCases.toLocaleString() || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                    <FiPieChart size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cazuri Recuperate</p>
                    <p className="text-2xl font-semibold">
                      {
                        summary?.casesByStatus.find(
                          status => status.status === CaseStatus.RECOVERED
                        )?.count || 0
                      }
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="border-l-4 border-red-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 text-red-500 mr-4">
                    <FiMap size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Locații Afectate</p>
                    <p className="text-2xl font-semibold">{summary?.topLocations.length || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                    <FiCalendar size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Boli Monitorizate</p>
                    <p className="text-2xl font-semibold">{summary?.casesByDisease.length || 0}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Grafice și statistici detaliate */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Grafic evoluție lunară */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Evoluția Cazurilor Recente</CardTitle>
                    <div className="flex items-center">
                      <label htmlFor="yearSelect" className="mr-2 text-sm text-gray-600">
                        An:
                      </label>
                      <select
                        id="yearSelect"
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedYear}
                        onChange={handleYearChange}
                      >
                        {availableYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 relative">
                    {yearLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                    
                    {monthlyData && monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlyData}
                          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            angle={-45} 
                            textAnchor="end" 
                            height={70} 
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            allowDecimals={false}
                            label={{ 
                              value: 'Număr cazuri', 
                              angle: -90, 
                              position: 'insideLeft', 
                              style: { textAnchor: 'middle' }
                            }}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} cazuri`, 'Total']}
                            labelFormatter={(label) => `Luna ${label} ${selectedYear}`}
                          />
                          <Legend />
                          <Bar 
                            dataKey="count" 
                            name="Cazuri" 
                            fill="#3B82F6" 
                            radius={[4, 4, 0, 0]}
                            animationDuration={500}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Nu există date disponibile pentru anul {selectedYear}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Graficul prezintă distribuția lunară a cazurilor pentru anul {selectedYear}
                    </p>
                    <Link href="/statistics" passHref>
                      <Button variant="outline" size="sm" className="hover:cursor-pointer">
                        Vezi Statistici Detaliate
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Distribuție status */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuția Cazurilor după Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {prepareStatusData().length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareStatusData()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={100}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareStatusData().map((entry, index) => (
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
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Nu există date disponibile</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <Link href="/statistics" passHref>
                      <Button variant="outline" size="sm" className="hover:cursor-pointer">
                        Vezi Statistici Detaliate
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cazuri recente */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Cazuri Recente</CardTitle>
                <Link href="/cases" passHref>
                  <Button variant="text" className="hover:cursor-pointer">
                    Vezi Toate Cazurile
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Boală
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Locație
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acțiuni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentCases.map((caseItem) => (
                        <tr key={caseItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{caseItem.disease}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(caseItem.status)}`}>
                              {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{caseItem.location?.name || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(caseItem.diagnosisDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link href={`/cases/${caseItem.id}`} passHref>
                              <Button variant="text" size="sm" className="hover:cursor-pointer">
                                Detalii
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secțiune informativă */}
          <div className="bg-gray-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Informații și Prevenție
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Informează-te despre bolile infecțioase și află cum să te protejezi pe tine și pe cei din jur.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Simptome</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Învață să recunoști simptomele comune ale bolilor infecțioase pentru a solicita ajutor medical la timp.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Prevenție</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Măsuri simple de prevenție pot reduce semnificativ riscul de infectare și răspândire a bolilor.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Tratament</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Informații despre opțiunile de tratament disponibile și când să soliciți ajutor medical.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-8">
                  <Link href="/about" passHref>
                    <Button variant="primary" size="lg" className="hover:cursor-pointer">
                      Află Mai Multe
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default Home;