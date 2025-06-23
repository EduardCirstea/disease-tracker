'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { Location } from '@/types/location';
import { getAllLocationsList, deleteLocation } from '@/services/locations.service';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import LocationModal from '@/components/LocationModal';

export default function LocationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await getAllLocationsList();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca locațiile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur doriți să ștergeți această locație?')) return;

    try {
      await deleteLocation(id);
      toast({
        title: 'Succes',
        description: 'Locația a fost ștearsă cu succes',
      });
      fetchLocations();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge locația',
        variant: 'destructive',
      });
    }
  };

  const handleViewLocation = (location: Location) => {
    setSelectedLocation(location);
    setViewModalOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setEditModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Locații</h1>
          <Button
            onClick={() => router.push('/locations/new')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FiPlus className="w-4 h-4" />
            Adaugă Locație
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Lista Locații</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">Se încarcă...</div>
            ) : locations.length === 0 ? (
              <div className="text-center py-4">Nu există locații înregistrate</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Oraș
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Județ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Țară
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locations.map((location) => (
                      <tr key={location.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {location.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {location.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {location.county}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {location.country || 'România'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewLocation(location)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLocation(location)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(location.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <LocationModal
          location={selectedLocation}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          mode="view"
        />

        <LocationModal
          location={selectedLocation}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          mode="edit"
          onLocationUpdated={fetchLocations}
        />
      </div>
    </MainLayout>
  );
} 