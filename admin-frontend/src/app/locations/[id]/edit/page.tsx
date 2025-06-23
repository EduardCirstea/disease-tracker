'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/use-toast';
import { Location } from '@/types/location';

export default function EditLocationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Location>>({
    name: '',
    city: '',
    county: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchLocation();
  }, [params.id]);

  const fetchLocation = async () => {
    try {
      const response = await api.get(`/admin/locations/${params.id}`);
      setFormData(response.data);
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut încărca locația',
        variant: 'destructive',
      });
      router.push('/locations');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch(`/admin/locations/${params.id}`, {
        ...formData,
        latitude: parseFloat(formData.latitude as string),
        longitude: parseFloat(formData.longitude as string),
      });

      toast({
        title: 'Succes',
        description: 'Locația a fost actualizată cu succes',
      });

      router.push('/locations');
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza locația',
        variant: 'destructive',
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
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Editează Locație</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name">Nume</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Oraș</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="county">Județ</Label>
          <Input
            id="county"
            name="county"
            value={formData.county}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="latitude">Latitudine</Label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitudine</Label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Se salvează...' : 'Salvează'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/locations')}
          >
            Anulează
          </Button>
        </div>
      </form>
    </div>
  );
} 