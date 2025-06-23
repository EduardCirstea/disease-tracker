'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Building2, Globe, Navigation } from 'lucide-react';
import { FiAlertTriangle, FiCheck, FiMapPin } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import LocationMap from '@/components/LocationMap';

export default function NewLocationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    county: '',
    country: 'România',
    latitude: '',
    longitude: '',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    city?: string;
    county?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
  }>({});

  const handleLocationSelect = (locationData: {
    latitude: number;
    longitude: number;
    name: string;
    city: string;
    county: string;
    country: string;
  }) => {
    setFormData({
      ...formData,
      name: locationData.name,
      city: locationData.city,
      county: locationData.county,
      country: locationData.country || 'România',
      latitude: locationData.latitude.toString(),
      longitude: locationData.longitude.toString(),
    });
    // Resetăm erorile când se selectează o locație
    setErrors({});

    // Afișăm notificarea la selectarea locației
    toast({
      title: 'Locație selectată',
      description: `S-au completat automat: ${locationData.city ? 'Oraș (' + locationData.city + ')' : ''} ${locationData.county ? 'Județ (' + locationData.county + ')' : ''} și coordonatele geografice.`,
      action: (
        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <FiMapPin />
        </div>
      ),
    });
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      city?: string;
      county?: string;
      country?: string;
      latitude?: string;
      longitude?: string;
    } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Numele locației este obligatoriu';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Orașul este obligatoriu';
    }
    
    if (!formData.county.trim()) {
      newErrors.county = 'Județul este obligatoriu';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Țara este obligatorie';
    }
    
    if (!formData.latitude.trim()) {
      newErrors.latitude = 'Latitudinea este obligatorie';
    } else if (isNaN(parseFloat(formData.latitude))) {
      newErrors.latitude = 'Latitudinea trebuie să fie un număr valid';
    }
    
    if (!formData.longitude.trim()) {
      newErrors.longitude = 'Longitudinea este obligatorie';
    } else if (isNaN(parseFloat(formData.longitude))) {
      newErrors.longitude = 'Longitudinea trebuie să fie un număr valid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Eroare de validare",
        description: "Vă rugăm să completați toate câmpurile obligatorii.",
        variant: "destructive",
        action: (
          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <FiAlertTriangle />
          </div>
        ),
      });
      return;
    }
    
    setLoading(true);

    try {
      await api.post('/admin/locations', {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });

      toast({
        title: 'Succes',
        description: 'Locația a fost adăugată cu succes',
        action: (
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <FiCheck />
          </div>
        ),
      });

      router.push('/locations');
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adăuga locația',
        variant: 'destructive',
        action: (
          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <FiAlertTriangle />
          </div>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Resetăm eroarea pentru acest câmp
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Adaugă Locație Nouă</h1>
          <Button
            onClick={() => router.push('/locations')}
            variant="outline"
            className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
          >
            Înapoi la Lista Locații
          </Button>
        </div>

        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-900">Informații Locație</CardTitle>
            <CardDescription className="text-gray-700">
              Completează toate câmpurile pentru a adăuga o locație nouă în sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Harta interactivă */}
              <div className="mb-6">
                <Label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Selectează locația pe hartă
                </Label>
                <div className="rounded-lg overflow-hidden h-[400px] border border-gray-200">
                  <LocationMap onLocationSelect={handleLocationSelect} />
                </div>
                <p className="text-sm text-blue-600 mt-2 flex items-center gap-1.5">
                  <FiMapPin className="flex-shrink-0" />
                  <span>Faceți click pe hartă pentru a selecta poziția exactă a locației</span>
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 font-medium text-gray-700">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Nume <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Numele locației"
                    className={`h-10 bg-white text-gray-800 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.name ? (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  ) : (
                    <p className="text-xs text-gray-500 italic mt-1">
                      Introdu manual numele specific al locației (ex: Spitalul Județean, Școala Nr. 5, etc.)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2 font-medium text-gray-700">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    Oraș <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Numele orașului"
                    className={`h-10 bg-white text-gray-800 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county" className="flex items-center gap-2 font-medium text-gray-700">
                    <Globe className="h-4 w-4 text-blue-500" />
                    Județ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="county"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    placeholder="Numele județului"
                    className={`h-10 bg-white text-gray-800 ${errors.county ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.county && (
                    <p className="text-xs text-red-500 mt-1">{errors.county}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center gap-2 font-medium text-gray-700">
                    <Globe className="h-4 w-4 text-blue-500" />
                    Țară <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Numele țării"
                    className={`h-10 bg-white text-gray-800 ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.country && (
                    <p className="text-xs text-red-500 mt-1">{errors.country}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latitude" className="flex items-center gap-2 font-medium text-gray-700">
                    <Navigation className="h-4 w-4 text-blue-500" />
                    Latitudine <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="text"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="ex: 44.4268"
                    className={`h-10 bg-white text-gray-800 ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.latitude && (
                    <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude" className="flex items-center gap-2 font-medium text-gray-700">
                    <Navigation className="h-4 w-4 text-blue-500" />
                    Longitudine <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="text"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="ex: 26.1025"
                    className={`h-10 bg-white text-gray-800 ${errors.longitude ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.longitude && (
                    <p className="text-xs text-red-500 mt-1">{errors.longitude}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/locations')}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                >
                  Anulează
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? 'Se salvează...' : 'Salvează Locația'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 