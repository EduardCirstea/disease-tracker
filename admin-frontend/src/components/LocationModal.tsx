import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Location } from '@/types/location';
import LocationMap from './LocationMap';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/use-toast';
import { FiMapPin, FiMap, FiAlertTriangle, FiCheck } from 'react-icons/fi';

interface LocationModalProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'edit';
  onLocationUpdated?: () => void;
}

export default function LocationModal({
  location,
  isOpen,
  onClose,
  mode,
  onLocationUpdated,
}: LocationModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<{
    name: string;
    city: string;
    county: string;
    country: string;
    latitude: string;
    longitude: string;
  }>({
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        city: location.city,
        county: location.county,
        country: location.country || 'România',
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      });
      setErrors({});
    }
  }, [location]);

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

    if (!location?.id) return;

    setLoading(true);
    try {
      await api.patch(`/admin/locations/${location.id}`, {
        name: formData.name,
        city: formData.city,
        county: formData.county,
        country: formData.country,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });

      toast({
        title: 'Succes',
        description: 'Locația a fost actualizată cu succes',
        action: (
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <FiCheck />
          </div>
        ),
      });

      onLocationUpdated?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza locația',
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {mode === 'view' ? (
              <>
                <FiMap className="text-blue-600" />
                Vizualizare Locație
              </>
            ) : (
              <>
                <FiMapPin className="text-blue-600" />
                Editare Locație
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold text-gray-700">Nume Locație <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={mode === 'view'}
                      className={`h-10 text-base bg-white ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-base font-semibold text-gray-700">Oraș <span className="text-red-500">*</span></Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={mode === 'view'}
                      className={`h-10 text-base bg-white ${errors.city ? 'border-red-500' : ''}`}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="county" className="text-base font-semibold text-gray-700">Județ <span className="text-red-500">*</span></Label>
                    <Input
                      id="county"
                      value={formData.county}
                      onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                      disabled={mode === 'view'}
                      className={`h-10 text-base bg-white ${errors.county ? 'border-red-500' : ''}`}
                    />
                    {errors.county && (
                      <p className="text-sm text-red-500">{errors.county}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-base font-semibold text-gray-700">Țară <span className="text-red-500">*</span></Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      disabled={mode === 'view'}
                      className={`h-10 text-base bg-white ${errors.country ? 'border-red-500' : ''}`}
                    />
                    {errors.country && (
                      <p className="text-sm text-red-500">{errors.country}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-base font-semibold text-gray-700">Latitudine <span className="text-red-500">*</span></Label>
                      <Input
                        id="latitude"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        disabled={mode === 'view'}
                        className={`h-10 text-base bg-white ${errors.latitude ? 'border-red-500' : ''}`}
                      />
                      {errors.latitude && (
                        <p className="text-sm text-red-500">{errors.latitude}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-base font-semibold text-gray-700">Longitudine <span className="text-red-500">*</span></Label>
                      <Input
                        id="longitude"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        disabled={mode === 'view'}
                        className={`h-10 text-base bg-white ${errors.longitude ? 'border-red-500' : ''}`}
                      />
                      {errors.longitude && (
                        <p className="text-sm text-red-500">{errors.longitude}</p>
                      )}
                    </div>
                  </div>
                </div>

                {mode === 'edit' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <FiMapPin className="flex-shrink-0" />
                      <span>Faceți click pe hartă pentru a actualiza coordonatele sau completați manual câmpurile de mai sus.</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="h-[500px] rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <LocationMap
                  onLocationSelect={handleLocationSelect}
                  initialLocation={
                    location
                      ? {
                          latitude: location.latitude,
                          longitude: location.longitude,
                          name: location.name,
                          city: location.city,
                          county: location.county,
                          country: location.country || 'România',
                        }
                      : undefined
                  }
                  disabled={mode === 'view'}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="border-t pt-4 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose} className="h-10 px-6">
            Închide
          </Button>
          {mode === 'edit' && (
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={loading} 
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Se salvează...' : 'Salvează'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 