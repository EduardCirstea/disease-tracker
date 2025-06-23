'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiActivity, FiFilter, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MainLayout from '../../components/layout/MainLayout';
import { getAllCases } from '../../services/cases.service';
import { CaseStatus } from '../../types/case';
import { formatDate } from '../../utils/date-utils';

export default function CasesPage() {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [totalCases, setTotalCases] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtru state
  const [filters, setFilters] = useState({
    disease: '',
    status: '' as string,
    startDate: '',
    endDate: ''
  });
  
  const itemsPerPage = 10;
  
  // Status colors pentru diferite statusuri de cazuri
  const STATUS_COLORS: Record<string, string> = {
    'suspected': '#F59E0B',  // Galben pentru suspectate
    'confirmed': '#EF4444',  // Roșu pentru confirmate
    'recovered': '#10B981',  // Verde pentru recuperate
    'deceased': '#6B7280',   // Gri pentru decedate
  };
  
  const STATUS_BG_COLORS: Record<string, string> = {
    'suspected': 'bg-amber-100 text-amber-800',
    'confirmed': 'bg-red-100 text-red-800',
    'recovered': 'bg-green-100 text-green-800',
    'deceased': 'bg-gray-100 text-gray-800',
  };

  useEffect(() => {
    fetchCases();
  }, [currentPage, filters]);

  const fetchCases = async () => {
    setLoading(true);
    
    try {
      const activeFilters = Object.entries(filters).reduce((acc: any, [key, value]) => {
        if (value) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const { items, total } = await getAllCases(currentPage, itemsPerPage, activeFilters);
      
      setCases(items);
      setTotalCases(total);
    } catch (error) {
      console.error('Eroare la încărcarea cazurilor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Resetăm la prima pagină când se aplică un nou filtru
    fetchCases();
  };

  const resetFilters = () => {
    setFilters({
      disease: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const totalPages = Math.ceil(totalCases / itemsPerPage);

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
          onClick={() => setCurrentPage(1)}
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
          onClick={() => setCurrentPage(i)}
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
          onClick={() => setCurrentPage(totalPages)}
          className="px-3 py-1 rounded-md text-sm hover:bg-gray-200 focus:outline-none"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <MainLayout title="Lista Cazuri | Monitorizare Boli Infecțioase">
      <div className="bg-blue-700 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Cazuri Boli Infecțioase</h1>
          <p className="mt-2">Monitorizare și analiză a cazurilor de boli infecțioase</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FiActivity className="inline-block mr-2" />
              Lista Cazuri
            </h2>
            <button
              onClick={toggleFilters}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiFilter className="mr-2" />
              {showFilters ? 'Ascunde Filtre' : 'Arată Filtre'}
            </button>
          </div>

          {showFilters && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filtrează Cazuri</h3>
              <form onSubmit={applyFilters}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="disease" className="block text-sm font-medium text-gray-700 mb-1">
                      Boală
                    </label>
                    <input
                      type="text"
                      id="disease"
                      name="disease"
                      value={filters.disease}
                      onChange={handleFilterChange}
                      placeholder="Nume boală"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Toate</option>
                      <option value={CaseStatus.SUSPECTED}>Suspect</option>
                      <option value={CaseStatus.CONFIRMED}>Confirmat</option>
                      <option value={CaseStatus.RECOVERED}>Recuperat</option>
                      <option value={CaseStatus.DECEASED}>Decedat</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      De la data
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Până la data
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Resetează
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Aplică Filtre
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white overflow-hidden shadow rounded-lg">
            {loading ? (
              <div className="p-10 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : cases.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="min-w-full divide-y divide-gray-200">
                  <div className="bg-gray-50">
                    <div className="grid grid-cols-12 gap-3 px-6 py-3">
                      <div className="col-span-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boală</div>
                      <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</div>
                      <div className="col-span-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locație</div>
                      <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</div>
                      <div className="col-span-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</div>
                    </div>
                  </div>
                  
                  <div className="bg-white divide-y divide-gray-200">
                    {cases.map((caseItem) => (
                      <div key={caseItem.id} className="grid grid-cols-12 gap-3 px-6 py-4 hover:bg-gray-50 transition duration-150 ease-in-out">
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              {caseItem.disease.substring(0, 1).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{caseItem.disease}</div>
                              <div className="text-sm text-gray-500">Pacient: {caseItem.patientId || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_BG_COLORS[caseItem.status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                            {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                          </span>
                          {caseItem.gender && (
                            <div className="text-xs text-gray-500 mt-1">
                              {caseItem.gender === 'M' ? 'Masculin' : caseItem.gender === 'F' ? 'Feminin' : 'Altul'}
                              {caseItem.age ? `, ${caseItem.age} ani` : ''}
                            </div>
                          )}
                        </div>
                        <div className="col-span-3">
                          <div className="text-sm text-gray-900">{caseItem.location?.name || 'Necunoscut'}</div>
                          <div className="text-xs text-gray-500">
                            {caseItem.location?.city && caseItem.location?.county
                              ? `${caseItem.location.city}, ${caseItem.location.county}`
                              : caseItem.location?.city || caseItem.location?.county || ''}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm text-gray-900">{formatDate(caseItem.diagnosisDate)}</div>
                          <div className="text-xs text-gray-500">Data diagnosticării</div>
                        </div>
                        <div className="col-span-2 text-right">
                          <Link 
                            href={`/cases/${caseItem.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Vezi detalii
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-gray-500">Nu a fost găsit niciun caz care să corespundă criteriilor de filtrare.</p>
              </div>
            )}
            
            {!loading && totalPages > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Afișare <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCases)}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCases)}</span> din <span className="font-medium">{totalCases}</span> rezultate
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 cursor-pointer'}`}
                      >
                        <span className="sr-only">Pagina anterioară</span>
                        <FiChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {renderPaginationButtons()}
                      
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50 cursor-pointer'}`}
                      >
                        <span className="sr-only">Pagina următoare</span>
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                Toate cazurile afișate sunt anonimizate și sunt prezentate doar în scopuri informative. 
                Pentru mai multe informații, consultați secțiunea Despre din meniul principal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 