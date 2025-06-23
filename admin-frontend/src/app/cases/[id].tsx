import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiEdit, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import MainLayout from '../../components/layout/MainLayout';
import { getCaseById, deleteCase } from '../../services/cases.service';
import { Case, CaseStatus } from '../../types/case';
import { formatDate } from '../../utils/date-utils';

const CaseDetailsPage: React.FC = () => {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;
  
  useEffect(() => {
    if (id) {
      const fetchCase = async () => {
        try {
          setLoading(true);
          const data = await getCaseById(id as string);
          setCaseData(data);
        } catch (error) {
          console.error('Error fetching case details:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCase();
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Sunteți sigur că doriți să ștergeți acest caz?')) {
      try {
        await deleteCase(id as string);
        router.push('/cases');
      } catch (error) {
        console.error('Error deleting case:', error);
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </MainLayout>
    );
  }

  if (!caseData) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>Cazul nu a fost găsit sau a fost șters.</p>
          <button
            onClick={() => router.push('/cases')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Înapoi la Lista de Cazuri
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Detalii Caz | Sistem Gestionare Boli Infecțioase</title>
      </Head>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Detalii Caz</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/cases/edit/${id}`)}
            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            <FiEdit className="mr-2" />
            Editează
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <FiTrash2 className="mr-2" />
            Șterge
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Date Pacient</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-sm font-medium text-gray-500">ID Pacient</dt>
                <dd className="text-sm text-gray-900">{caseData.patientId}</dd>
                
                <dt className="text-sm font-medium text-gray-500">Vârstă</dt>
                <dd className="text-sm text-gray-900">{caseData.age}</dd>
                
                <dt className="text-sm font-medium text-gray-500">Gen</dt>
                <dd className="text-sm text-gray-900">{caseData.gender}</dd>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Date Diagnostic</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-sm font-medium text-gray-500">Boală</dt>
                <dd className="text-sm text-gray-900">{caseData.disease}</dd>
                
                <dt className="text-sm font-medium text-gray-500">Data Diagnosticării</dt>
                <dd className="text-sm text-gray-900">{formatDate(caseData.diagnosisDate)}</dd>
                
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full
                    ${caseData.status === CaseStatus.SUSPECTED ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${caseData.status === CaseStatus.CONFIRMED ? 'bg-orange-100 text-orange-800' : ''}
                    ${caseData.status === CaseStatus.RECOVERED ? 'bg-green-100 text-green-800' : ''}
                    ${caseData.status === CaseStatus.DECEASED ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {caseData.status}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Simptome</h3>
            <div className="flex flex-wrap gap-2">
              {caseData.symptoms.map((symptom, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Locație</h3>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
              <dt className="text-sm font-medium text-gray-500">Nume</dt>
              <dd className="text-sm text-gray-900">{caseData.location?.name || 'N/A'}</dd>
              
              <dt className="text-sm font-medium text-gray-500">Oraș</dt>
              <dd className="text-sm text-gray-900">{caseData.location?.city || 'N/A'}</dd>
              
              <dt className="text-sm font-medium text-gray-500">Județ</dt>
              <dd className="text-sm text-gray-900">{caseData.location?.county || 'N/A'}</dd>
              
              <dt className="text-sm font-medium text-gray-500">Țară</dt>
              <dd className="text-sm text-gray-900">{caseData.location?.country || 'N/A'}</dd>
            </dl>
          </div>
          
          {caseData.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Note</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-900 whitespace-pre-line">{caseData.notes}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Înapoi
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CaseDetailsPage;