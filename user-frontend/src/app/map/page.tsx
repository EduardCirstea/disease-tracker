"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import MainLayout from '../../components/layout/MainLayout';
import { getGeospatialStats } from '../../services/statistics.service';
import { GeospatialDataPoint } from '../../types/statistics';

// Importare dinamică a componentelor de hartă pentru a evita erorile la server-side rendering
const DynamicMap = dynamic(
  () => import('../../components/map/DiseaseMap'),
  { ssr: false } // Această componentă va fi încărcată doar pe partea client
);

const MapPage: React.FC = () => {
  const [geospatialData, setGeospatialData] = useState<GeospatialDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<'heat' | 'markers'>('heat');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getGeospatialStats();
        setGeospatialData(data);
      } catch (error) {
        console.error('Error fetching geospatial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout title="Hartă | Monitorizare Boli Infecțioase">
      <div className="bg-blue-700 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Hartă Cazuri</h1>
          <p className="mt-2">Distribuția geografică a cazurilor de boli infecțioase</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader className="flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle>Distribuția Cazurilor</CardTitle>
            <div className="mt-2 sm:mt-0 flex space-x-2">
              <Button
                variant={mapType === 'heat' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setMapType('heat')}
              >
                Hartă Căldură
              </Button>
              <Button
                variant={mapType === 'markers' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setMapType('markers')}
              >
                Marcatori
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="h-96 lg:h-[600px] rounded-lg overflow-hidden">
                <DynamicMap data={geospatialData} mapType={mapType} />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Legendă</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Intensitate culori</h3>
                  <div className="h-4 w-full rounded-md bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
                  <div className="flex justify-between mt-1 text-xs text-gray-600">
                    <span>Puține cazuri</span>
                    <span>Multe cazuri</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Utilizare</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Folosiți butonul de <strong>Hartă Căldură</strong> pentru a vedea zonele cu concentrații mari de cazuri</li>
                    <li>• Folosiți butonul de <strong>Marcatori</strong> pentru a vedea locațiile exacte și numărul de cazuri</li>
                    <li>• Dați click pe marcatori pentru informații detaliate</li>
                    <li>• Folosiți controalele de zoom pentru a explora mai detaliat</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Locații Afectate</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-72">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Locație
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Județ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cazuri
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {geospatialData
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 10)
                        .map((location, index) => (
                          <tr key={location.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {location.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                              {location.county}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {location.count}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MapPage;