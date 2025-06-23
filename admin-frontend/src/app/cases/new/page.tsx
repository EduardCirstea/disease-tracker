'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/use-toast';
import { CaseStatus } from '@/types/case';
import { Location } from '@/types/location';
import { getLocations } from '@/services/cases.service';

export default function NewCasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    disease: '',
    status: CaseStatus.SUSPECTED,
    diagnosisDate: '',
    description: '',
    symptoms: '',
    treatment: '',
    locationId: '',
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut încărca locațiile',
          variant: 'destructive',
        });
      }
    };

    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/admin/cases', formData);
      toast({
        title: 'Succes',
        description: 'Cazul a fost creat cu succes',
      });
      router.push('/cases');
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut crea cazul',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Adaugă Caz Nou</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="disease">Boală</Label>
          <Input
            id="disease"
            name="disease"
            value={formData.disease}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as CaseStatus }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selectează statusul" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CaseStatus.SUSPECTED}>Suspectat</SelectItem>
              <SelectItem value={CaseStatus.CONFIRMED}>Confirmat</SelectItem>
              <SelectItem value={CaseStatus.RECOVERED}>Recuperat</SelectItem>
              <SelectItem value={CaseStatus.DECEASED}>Decedat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationId">Locație</Label>
          <Select
            value={formData.locationId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selectează locația" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name} - {location.city}, {location.county}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagnosisDate">Data Diagnosticării</Label>
          <Input
            id="diagnosisDate"
            name="diagnosisDate"
            type="date"
            value={formData.diagnosisDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descriere</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="symptoms">Simptome</Label>
          <Input
            id="symptoms"
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="treatment">Tratament</Label>
          <Input
            id="treatment"
            name="treatment"
            value={formData.treatment}
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
            onClick={() => router.push('/cases')}
          >
            Anulează
          </Button>
        </div>
      </form>
    </div>
  );
} 