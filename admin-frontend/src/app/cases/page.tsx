'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiPlus, FiFilter, FiEdit, FiTrash2, FiEye, FiUser, FiCalendar, FiMapPin, FiActivity, FiX, FiFileText } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { getAllCases, deleteCase, getCaseById, updateCase, getLocations } from '@/services/cases.service';
import { Case, CaseStatus } from '@/types/case';
import { Location } from '@/types/location';
import { formatDate } from '@/utils/date-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal, Text, Group, Stack, Divider, LoadingOverlay, Textarea } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { format } from 'date-fns';
import { notifications } from '@mantine/notifications';
import { ChevronDown } from 'lucide-react';

const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [totalCases, setTotalCases] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Stări pentru modale
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchCases();
  }, [currentPage, searchTerm, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLocationsLoading(true);
      const data = await getLocations();
      setLocations(data as Location[]);
    } catch (error) {
      console.error('Eroare la încărcarea locațiilor:', error);
      notifications.show({
        title: 'Eroare',
        message: 'Nu s-au putut încărca locațiile',
        color: 'red',
      });
    } finally {
      setLocationsLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (searchTerm) {
        filters.disease = searchTerm;
      }
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      if (startDate) {
        filters.startDate = startDate;
      }
      
      if (endDate) {
        filters.endDate = endDate;
      }
      
      const response = await getAllCases(currentPage, itemsPerPage, filters);
      setCases(response.items);
      setTotalCases(response.total);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru deschiderea modalului de vizualizare
  const openViewModal = async (id: string) => {
    try {
      setModalLoading(true);
      const caseData = await getCaseById(id);
      setSelectedCase(caseData);
      setViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching case details:', error);
      notifications.show({
        title: 'Eroare',
        message: 'Nu s-a putut încărca cazul',
        color: 'red',
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Funcție pentru deschiderea modalului de editare
  const openEditModal = async (id: string) => {
    try {
      setModalLoading(true);
      const caseData = await getCaseById(id);
      setSelectedCase(caseData);
      setEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching case details:', error);
      notifications.show({
        title: 'Eroare',
        message: 'Nu s-a putut încărca cazul',
        color: 'red',
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Funcție pentru salvarea modificărilor
  const handleSaveChanges = async () => {
    if (!selectedCase) return;
    
    setSaving(true);
    try {
      const updateData = {
        patientId: selectedCase.patientId,
        age: selectedCase.age,
        gender: selectedCase.gender,
        disease: selectedCase.disease,
        symptoms: selectedCase.symptoms,
        diagnosisDate: selectedCase.diagnosisDate,
        status: selectedCase.status,
        locationId: selectedCase.locationId,
        notes: selectedCase.notes
      };

      await updateCase(selectedCase.id, updateData);
      notifications.show({
        title: 'Succes',
        message: 'Cazul a fost actualizat',
        color: 'green',
      });
      setEditModalOpen(false);
      fetchCases(); // Reîncărcăm lista de cazuri pentru a vedea modificările
    } catch (error) {
      console.error('Error updating case:', error);
      notifications.show({
        title: 'Eroare',
        message: 'Nu s-a putut actualiza cazul',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCases();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sunteți sigur că doriți să ștergeți acest caz?')) {
      try {
        await deleteCase(id);
        // Actualizare listă după ștergere
        fetchCases();
      } catch (error) {
        console.error('Error deleting case:', error);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterReset = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Calcularea paginării
  const totalPages = Math.ceil(totalCases / itemsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.SUSPECTED:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Suspectat</Badge>;
      case CaseStatus.CONFIRMED:
        return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">Confirmat</Badge>;
      case CaseStatus.RECOVERED:
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Recuperat</Badge>;
      case CaseStatus.DECEASED:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Decedat</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  // Funcție pentru navigarea către pagina de adăugare locație
  const handleAddLocation = () => {
    router.push('/locations/new');
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex flex-col space-y-1.5">
          <h1 className="text-2xl font-bold text-gray-900">Registru Cazuri</h1>
          <p className="text-gray-500">Gestionați și monitorizați toate cazurile din sistem</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-gray-900">Opțiuni căutare și filtrare</CardTitle>
            <CardDescription className="text-gray-500">Găsiți rapid cazurile după criterii specifice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4 gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <Input
                    type="text"
                    placeholder="Caută după boală..."
                    className="w-full pl-10 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
              <Button
                onClick={() => router.push('/cases/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FiPlus className="mr-2" />
                Înregistrare caz nou
              </Button>
            </div>

            <div className="flex justify-center">
            <Button
              onClick={handleFilterToggle}
              variant="outline"
                className="mx-auto px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <FiFilter className="mr-2" />
              {showFilters ? 'Ascunde filtre' : 'Arată filtre avansate'}
            </Button>
            </div>

            {showFilters && (
              <div className="p-5 border rounded-md mt-4 bg-slate-50 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as CaseStatus | '')}
                    >
                      <option value="">Toate</option>
                      <option value={CaseStatus.SUSPECTED}>Suspectat</option>
                      <option value={CaseStatus.CONFIRMED}>Confirmat</option>
                      <option value={CaseStatus.RECOVERED}>Recuperat</option>
                      <option value={CaseStatus.DECEASED}>Decedat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiCalendar className="inline mr-1" size={14} />
                      Data început
                    </label>
                    <Input
                      type="date"
                      className="w-full bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiCalendar className="inline mr-1" size={14} />
                      Data sfârșit
                    </label>
                    <Input
                      type="date"
                      className="w-full bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleFilterReset}
                    variant="ghost"
                    className="mr-2 hover:bg-gray-100"
                  >
                    Resetare
                  </Button>
                  <Button
                    onClick={() => fetchCases()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Aplică Filtre
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-900">Lista cazurilor</CardTitle>
            <CardDescription className="text-gray-500">
              {loading ? 'Se încarcă...' : `${totalCases} cazuri înregistrate în total`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : cases.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FiActivity size={48} className="text-slate-300 mb-4" />
                <p className="text-lg text-slate-600 mb-2">Nu au fost găsite cazuri.</p>
                <p className="text-sm text-slate-500 mb-4">Adăugați primul caz în sistem pentru a începe monitorizarea.</p>
                <Button
                  onClick={() => router.push('/cases/create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FiPlus className="mr-2" />
                  Înregistrare caz nou
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <FiUser className="inline mr-1" /> ID Pacient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <FiActivity className="inline mr-1" /> Boală
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <FiMapPin className="inline mr-1" /> Locație
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <FiCalendar className="inline mr-1" /> Data Diagnosticării
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {cases.map((caseItem) => (
                      <tr key={caseItem.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {caseItem.patientId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {caseItem.disease}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {caseItem.location?.name || caseItem.locationName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(caseItem.diagnosisDate || caseItem.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(caseItem.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            onClick={() => openViewModal(caseItem.id)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <FiEye size={16} />
                          </Button>
                          <Button
                            onClick={() => openEditModal(caseItem.id)}
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 mx-1"
                          >
                            <FiEdit size={16} />
                          </Button>
                          <Button
                            onClick={() => handleDelete(caseItem.id)}
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                          >
                            <FiTrash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginare */}
            {!loading && cases.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 mt-4">
                <div>
                  <p className="text-sm text-gray-700">
                    Afișarea <span className="font-medium">{cases.length}</span> din{' '}
                    <span className="font-medium">{totalCases}</span> rezultate
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className={`rounded-l-md ${
                        currentPage === 1
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      &laquo;
                    </Button>
                    {pageNumbers.map((page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={`${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : ''
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className={`rounded-r-md ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      &raquo;
                    </Button>
                  </nav>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal pentru vizualizare */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={<div className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-3">Detalii Caz</div>}
        size="lg"
        centered
        radius="md"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        classNames={{
          content: 'bg-white rounded-lg shadow-xl',
          header: 'border-b-0 pb-0',
          title: 'text-gray-900 w-full',
          close: 'bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded-full',
        }}
      >
        {modalLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingOverlay visible />
          </div>
        ) : selectedCase ? (
          <div className="px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-5 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                  <FiUser className="mr-2 text-blue-600" />
                  Date Pacient
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                    <span className="font-medium text-blue-700">ID Pacient:</span>
                    <span className="text-gray-800">{selectedCase.patientId}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                    <span className="font-medium text-blue-700">Vârstă:</span>
                    <span className="text-gray-800">{selectedCase.age} ani</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                    <span className="font-medium text-blue-700">Gen:</span>
                    <span className="text-gray-800">{selectedCase.gender === 'M' ? 'Masculin' : selectedCase.gender === 'F' ? 'Feminin' : 'Altul'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-5 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-4 flex items-center">
                  <FiActivity className="mr-2 text-green-600" />
                  Date Diagnostic
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-green-100">
                    <span className="font-medium text-green-700">Boală:</span>
                    <span className="text-gray-800">{selectedCase.disease}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-green-100">
                    <span className="font-medium text-green-700">Data Diagnosticului:</span>
                    <span className="text-gray-800">{selectedCase.diagnosisDate && format(new Date(selectedCase.diagnosisDate), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-green-100">
                    <span className="font-medium text-green-700">Stare:</span>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold 
                      ${selectedCase.status === CaseStatus.SUSPECTED ? 'bg-amber-100 text-amber-800' : ''}
                      ${selectedCase.status === CaseStatus.CONFIRMED ? 'bg-rose-100 text-rose-800' : ''}
                      ${selectedCase.status === CaseStatus.RECOVERED ? 'bg-emerald-100 text-emerald-800' : ''}
                      ${selectedCase.status === CaseStatus.DECEASED ? 'bg-slate-300 text-slate-800' : ''}
                    ">{selectedCase.status.charAt(0) + selectedCase.status.slice(1).toLowerCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            <Divider my="md" label={<span className="text-gray-500 font-medium flex items-center"><FiMapPin className="mr-2" />Locație</span>} labelPosition="left" />

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-y-3">
                <div className="col-span-2 md:col-span-1">
                  <span className="font-medium text-gray-600">Locație:</span>{' '}
                  <span className="text-gray-800">
                    {selectedCase.location ? 
                      `${selectedCase.location.name}, ${selectedCase.location.city}` : 
                      'Nespecificată'}
                  </span>
                </div>
                {selectedCase.location?.county && (
                  <div className="col-span-2 md:col-span-1">
                    <span className="font-medium text-gray-600">Județ:</span>{' '}
                    <span className="text-gray-800">{selectedCase.location.county}</span>
                  </div>
                )}
              </div>
            </div>

            <Divider my="md" label={<span className="text-gray-500 font-medium flex items-center"><FiActivity className="mr-2" />Simptome</span>} labelPosition="left" />

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex flex-wrap gap-2">
                {selectedCase.symptoms?.map((symptom, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                    {symptom}
                  </span>
                ))}
                {(!selectedCase.symptoms || selectedCase.symptoms.length === 0) && (
                  <span className="text-gray-500">Nu au fost raportate simptome</span>
                )}
              </div>
            </div>

            {selectedCase.notes && (
              <>
                <Divider my="md" label={<span className="text-gray-500 font-medium flex items-center"><FiFileText className="mr-2" />Note</span>} labelPosition="left" />
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-800 whitespace-pre-line">{selectedCase.notes}</p>
                </div>
              </>
            )}

            <Group justify="flex-end" mt="lg">
              <Button
                variant="default"
                onClick={() => setViewModalOpen(false)}
                className="bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
              >
                Închide
              </Button>
              <Button
                onClick={() => {
                  setViewModalOpen(false);
                  openEditModal(selectedCase.id);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Editare
              </Button>
            </Group>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiActivity className="mx-auto text-gray-400 mb-4" size={48} />
            <Text color="dimmed" size="lg" className="text-center">Nu s-au găsit date pentru acest caz.</Text>
          </div>
        )}
      </Modal>

      {/* Modal pentru editare */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={<div className="text-2xl font-semibold text-gray-800 border-b pb-3 mb-3">Editare Caz</div>}
        size="lg"
        centered
        radius="md"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        classNames={{
          content: 'bg-white rounded-lg shadow-xl',
          header: 'border-b-0 pb-0',
          title: 'text-gray-900 w-full',
          close: 'bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded-full',
        }}
      >
        {modalLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingOverlay visible />
          </div>
        ) : selectedCase ? (
          <form 
            id="editCaseForm"
            onSubmit={(e) => { 
              e.preventDefault(); 
              handleSaveChanges(); 
            }}
          >
            <div className="px-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId" className="font-medium flex items-center  text-gray-800">
                      <FiUser className="mr-2 text-blue-500" />
                      ID Pacient
                    </Label>
                    <Input
                      id="patientId"
                      value={selectedCase.patientId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedCase({ ...selectedCase, patientId: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-blue-500 text-gray-800 shadow-sm"
                      placeholder="P001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age" className="font-medium flex items-center text-blue-700">
                      <FiUser className="mr-2 text-blue-500" />
                      Vârstă
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={selectedCase.age.toString()}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedCase({ ...selectedCase, age: Number(e.target.value) })}
                      min={0}
                      max={120}
                      required
                      className="bg-white border-gray-300 focus:border-blue-500 text-gray-800 shadow-sm"
                      placeholder="30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="font-medium flex items-center text-blue-700">
                      <FiUser className="mr-2 text-blue-500" />
                      Gen
                    </Label>
                    <div className="relative">
                      <select
                        id="gender"
                        value={selectedCase.gender}
                        onChange={(e) => {
                          const value = e.target.value;
                          console.log("Gender changed to:", value);
                          setSelectedCase({ ...selectedCase, gender: value });
                        }}
                        className="w-full h-10 px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 appearance-none"
                      >
                        <option value="" disabled>Selectați genul</option>
                        <option value="M">Masculin</option>
                        <option value="F">Feminin</option>
                        <option value="Altul">Altul</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-medium flex items-center text-blue-700">
                      <FiActivity className="mr-2 text-blue-500" />
                      Stare
                    </Label>
                    <div className="relative">
                      <select
                        id="status"
                        value={selectedCase.status}
                        onChange={(e) => {
                          const value = e.target.value;
                          console.log("Status changed to:", value);
                          setSelectedCase({ 
                            ...selectedCase, 
                            status: value as CaseStatus
                          });
                        }}
                        className="w-full h-10 px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 appearance-none"
                      >
                        <option value="" disabled>Selectați starea</option>
                        <option value={CaseStatus.SUSPECTED}>Suspectat</option>
                        <option value={CaseStatus.CONFIRMED}>Confirmat</option>
                        <option value={CaseStatus.RECOVERED}>Recuperat</option>
                        <option value={CaseStatus.DECEASED}>Decedat</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="locationId" className="font-medium flex items-center text-blue-700">
                      <FiMapPin className="mr-2 text-blue-500" />
                      Locație
                    </Label>
                    <div className="flex flex-col space-y-2">
                      <div className="relative">
                        <select
                          id="locationId"
                          value={selectedCase.locationId}
                          onChange={(e) => {
                            const value = e.target.value;
                            console.log("Location changed to:", value);
                            setSelectedCase({ 
                              ...selectedCase, 
                              locationId: value
                            });
                          }}
                          className="w-full h-10 px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 appearance-none"
                        >
                          <option value="" disabled>Selectați locația</option>
                          {locationsLoading ? (
                            <option value="" disabled>Se încarcă...</option>
                          ) : locations.length === 0 ? (
                            <option value="" disabled>Nu există locații</option>
                          ) : (
                            locations.map((loc: any) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.name}, {loc.city}
                              </option>
                            ))
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/locations/new')}
                        className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800 transition-colors flex items-center justify-center h-10 font-medium shadow-sm"
                      >
                        <FiPlus className="mr-2" size={16} />
                        Adaugă locație nouă
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="disease" className="font-medium flex items-center text-green-700">
                      <FiActivity className="mr-2 text-green-500" />
                      Boală
                    </Label>
                    <Input
                      id="disease"
                      value={selectedCase.disease}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedCase({ ...selectedCase, disease: e.target.value })}
                      required
                      className="bg-white border-gray-300 focus:border-green-500 text-gray-800 shadow-sm"
                      placeholder="COVID-19"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-medium flex items-center text-green-700">
                      <FiCalendar className="mr-2 text-green-500" />
                      Data Diagnosticului
                    </Label>
                    <div className="bg-white border border-gray-300 rounded-md overflow-hidden p-2">
                      <DatePicker
                        value={selectedCase.diagnosisDate ? new Date(selectedCase.diagnosisDate) : null}
                        onChange={(date) => setSelectedCase({ 
                          ...selectedCase, 
                          diagnosisDate: date ? date.toISOString() : selectedCase.diagnosisDate 
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Divider my="md" label={<span className="text-gray-600 font-medium">Simptome și Note</span>} labelPosition="center" />
              
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="font-medium flex items-center">
                    <FiActivity className="mr-2 text-blue-500" />
                    Simptome
                  </Label>
                  <Textarea
                    id="symptoms"
                    value={selectedCase.symptoms?.join(', ')}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSelectedCase({ 
                      ...selectedCase, 
                      symptoms: e.target.value.split(',').map((s: string) => s.trim()) 
                    })}
                    placeholder="Separați simptomele prin virgulă (ex: febră, tuse, dureri de cap)"
                    required
                    className="bg-white border-gray-300 min-h-[100px]"
                    styles={{ input: { minHeight: '100px' } }}
                  />
                  <p className="text-xs text-gray-500 italic mt-1">
                    Introduceți simptomele separate prin virgule. De exemplu: febră, tuse, durere în gât
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-medium flex items-center">
                    <FiFileText className="mr-2 text-blue-500" />
                    Note
                  </Label>
                  <Textarea
                    id="notes"
                    value={selectedCase.notes || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSelectedCase({ ...selectedCase, notes: e.target.value })}
                    placeholder="Adăugați observații suplimentare despre caz"
                    className="bg-white border-gray-300 min-h-[100px]"
                    styles={{ input: { minHeight: '100px' } }}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>Ultima actualizare: {selectedCase.updatedAt && format(new Date(selectedCase.updatedAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
                <Group justify="flex-end" mt="md">
                  <Button
                    type="button" 
                    variant="outline"
                    onClick={() => setEditModalOpen(false)}
                    className="border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Anulează
                  </Button>
                  <Button
                    form="editCaseForm"
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                  >
                    {saving ? 'Se salvează...' : 'Salvează modificările'}
                  </Button>
                </Group>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-12">
            <FiActivity className="mx-auto text-gray-400 mb-4" size={48} />
            <Text color="dimmed" size="lg" className="text-center">Nu s-au găsit date pentru acest caz.</Text>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};

export default CasesPage;