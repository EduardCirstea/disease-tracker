'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiChevronLeft, FiCalendar, FiMapPin, FiUser, FiActivity, FiFileText, FiTrendingUp } from 'react-icons/fi';
import MainLayout from '../../../components/layout/MainLayout';
import { getCaseById } from '../../../services/cases.service';
import { Case, CaseStatus } from '../../../types/case';
import { formatDate } from '../../../utils/date-utils';

export default function CaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const caseId = params.id as string;

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        setLoading(true);
        const data = await getCaseById(caseId);
        setCaseData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching case details:', err);
        setError('Nu am putut încărca detaliile cazului. Vă rugăm încercați din nou.');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCaseDetails();
    }
  }, [caseId]);

  // Funcție pentru a determina clasa de culoare în funcție de status
  const getStatusColorClass = (status: CaseStatus): string => {
    switch (status) {
      case CaseStatus.SUSPECTED:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case CaseStatus.CONFIRMED:
        return 'bg-red-100 text-red-800 border-red-200';
      case CaseStatus.RECOVERED:
        return 'bg-green-100 text-green-800 border-green-200';
      case CaseStatus.DECEASED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Funcție pentru afișarea statusului într-un format mai prietenos
  const formatStatus = (status: CaseStatus): string => {
    const statusMap: Record<CaseStatus, string> = {
      [CaseStatus.SUSPECTED]: 'Suspect',
      [CaseStatus.CONFIRMED]: 'Confirmat',
      [CaseStatus.RECOVERED]: 'Recuperat',
      [CaseStatus.DECEASED]: 'Decedat'
    };
    
    return statusMap[status] || status;
  };

  return (
    <MainLayout title={`Detalii Caz | ${caseData?.disease || 'Încărcare...'}`}>
      <div className="bg-blue-700 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-4 p-2 rounded-full bg-blue-600 hover:bg-blue-800 transition-colors"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Detalii Caz</h1>
              <p className="mt-1 text-blue-100">Informații complete despre cazul selectat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Eroare: </strong>
            <span className="block sm:inline">{error}</span>
            <div className="mt-3">
              <Link 
                href="/cases" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Înapoi la Lista de Cazuri
              </Link>
            </div>
          </div>
        ) : caseData ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header cu informații principale */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                      {caseData.disease.substring(0, 1).toUpperCase()}
                    </span>
                    {caseData.disease}
                  </h2>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(caseData.status)}`}>
                      {formatStatus(caseData.status)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      Data diagnosticării: {formatDate(caseData.diagnosisDate)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="text-sm font-medium text-gray-500">ID Caz:</span>
                  <span className="ml-2 text-sm text-gray-900">{caseData.id}</span>
                </div>
              </div>
            </div>

            {/* Grid cu toate informațiile detaliate */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informații despre pacient */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiUser className="h-5 w-5 text-blue-500 mr-2" />
                    Informații Pacient
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2">
                      <div className="text-sm font-medium text-gray-500">ID Pacient</div>
                      <div className="text-sm text-gray-900">{caseData.patientId || 'Necunoscut'}</div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="text-sm font-medium text-gray-500">Vârstă</div>
                      <div className="text-sm text-gray-900">{caseData.patientAge || caseData.age || 'Necunoscută'} ani</div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="text-sm font-medium text-gray-500">Gen</div>
                      <div className="text-sm text-gray-900">
                        {caseData.patientGender === 'MALE' || caseData.gender === 'M' ? 'Masculin' : 
                         caseData.patientGender === 'FEMALE' || caseData.gender === 'F' ? 'Feminin' : 
                         caseData.patientGender === 'OTHER' || caseData.gender === 'Altul' ? 'Altul' : 'Necunoscut'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Locație */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiMapPin className="h-5 w-5 text-blue-500 mr-2" />
                    Locație
                  </h3>
                  {caseData.location ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2">
                        <div className="text-sm font-medium text-gray-500">Nume Locație</div>
                        <div className="text-sm text-gray-900">{caseData.location.name}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-sm font-medium text-gray-500">Oraș</div>
                        <div className="text-sm text-gray-900">{caseData.location.city || 'Necunoscut'}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-sm font-medium text-gray-500">Județ</div>
                        <div className="text-sm text-gray-900">{caseData.location.county || 'Necunoscut'}</div>
                      </div>
                      {caseData.location.latitude && caseData.location.longitude && (
                        <div className="grid grid-cols-2">
                          <div className="text-sm font-medium text-gray-500">Coordonate</div>
                          <div className="text-sm text-gray-900">
                            {caseData.location.latitude}, {caseData.location.longitude}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Locația nu este disponibilă pentru acest caz.</p>
                  )}
                </div>

                {/* Simptome */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiActivity className="h-5 w-5 text-blue-500 mr-2" />
                    Simptome
                  </h3>
                  {caseData.symptoms && caseData.symptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {caseData.symptoms.map((symptom, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nu există simptome înregistrate pentru acest caz.</p>
                  )}
                </div>

                {/* Note și observații */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiFileText className="h-5 w-5 text-blue-500 mr-2" />
                    Note și Observații
                  </h3>
                  {caseData.notes ? (
                    <p className="text-sm text-gray-700 whitespace-pre-line">{caseData.notes}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Nu există note pentru acest caz.</p>
                  )}
                </div>
              </div>

              {/* Date adiţionale și istoricul actualizărilor */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FiCalendar className="h-5 w-5 text-blue-500 mr-2" />
                  Informații Temporale
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Data Diagnosticării</div>
                    <div className="text-sm text-gray-900">{formatDate(caseData.diagnosisDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Data Creării</div>
                    <div className="text-sm text-gray-900">{formatDate(caseData.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Ultima Actualizare</div>
                    <div className="text-sm text-gray-900">{formatDate(caseData.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer cu acțiuni */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between">
                <Link 
                  href="/cases" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiChevronLeft className="-ml-1 mr-2 h-5 w-5" />
                  Înapoi la Lista de Cazuri
                </Link>
                {/* Nu avem acțiuni suplimentare deocamdată în interfața utilizator */}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">Cazul solicitat nu a fost găsit sau nu aveți permisiunea de a-l vizualiza.</p>
            <div className="mt-4">
              <Link 
                href="/cases" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Înapoi la Lista de Cazuri
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 