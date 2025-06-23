'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCase, getLocations, CreateCaseDto } from '@/services/cases.service';
import { useToast } from '@/components/ui/use-toast';
import { CaseStatus } from '@/types/case';
import { Location } from '@/types/location';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  FiPlus, 
  FiList, 
  FiUser, 
  FiCalendar, 
  FiMapPin, 
  FiActivity, 
  FiFileText, 
  FiAlertCircle, 
  FiThermometer
} from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';

// Interfață pentru datele de intrare din formular (symptoms ca string pentru UI)
interface CaseFormData {
  patientId: string;
  age: number;
  gender: string;
  disease: string;
  symptoms: string;
  diagnosisDate: string;
  status: CaseStatus;
  locationId: string;
  notes?: string;
}

export default function CreateCasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState<CaseFormData>({
    patientId: '',
    age: 0,
    gender: '',
    disease: '',
    status: CaseStatus.SUSPECTED,
    diagnosisDate: '',
    symptoms: '',
    locationId: '',
    notes: '',
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
        console.log('Locații încărcate:', data);
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
      // Facem trim la valorile de text și convertim symptoms din string în array
      const caseData = {
        ...formData,
        patientId: formData.patientId.trim(),
        disease: formData.disease.trim(),
        gender: formData.gender.trim(),
        symptoms: formData.symptoms.split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0),
        notes: formData.notes?.trim(),
      };

      await createCase(caseData);
      toast({
        title: 'Succes',
        description: 'Cazul a fost înregistrat cu succes',
      });
      router.push('/cases');
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut înregistra cazul',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : 
              name === 'symptoms' ? value.replace(/\s*,\s*/g, ',') : value,
    }));
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Înregistrare Caz Nou</h1>
            <p className="text-gray-500 mt-1">Completați formularul cu detaliile pacientului și diagnosticul</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/cases')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FiList className="w-4 h-4" />
              Lista Cazuri
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informații pacient */}
          <Card className="col-span-1">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center gap-2 text-blue-700 ">
                <FiUser className="w-5 h-5" />
                Informații Pacient
              </CardTitle>
              <CardDescription>
                <p className="text-gray-800">Datele de identificare ale pacientului</p>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId" className="flex items-center gap-2 font-medium text-gray-800">
                      <FiUser className="w-4 h-4 text-blue-500" />
                      ID Pacient
                    </Label>
                    <Input
                      id="patientId"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleChange}
                      required
                      placeholder="Introduceți ID-ul pacientului"
                      className="h-11 bg-white text-gray-800 border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="flex items-center gap-2 font-medium text-gray-800">
                      <FiUser className="w-4 h-4 text-blue-500" />
                      Vârstă
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="0"
                      max="120"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      placeholder="Introduceți vârsta"
                      className="h-11 bg-white text-gray-800 border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="flex items-center gap-2 font-medium text-gray-800">
                      <FiUser className="w-4 h-4 text-blue-500" />
                      Gen
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                      required
                    >
                      <SelectTrigger className="h-11 bg-white text-gray-800 border-gray-300">
                        <SelectValue placeholder="Selectează genul" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Feminin</SelectItem>
                        <SelectItem value="Altul">Altul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Informații diagnostic */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <FiActivity className="w-5 h-5" />
                Informații Diagnostic
              </CardTitle>
              <CardDescription>
                <p className="text-gray-800">Detalii despre boală, simptome și diagnostic</p>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="disease" className="flex items-center gap-2 font-medium text-gray-800">
                      <FiFileText className="w-4 h-4 text-green-500" />
                      Boală
                    </Label>
                    <Input
                      id="disease"
                      name="disease"
                      value={formData.disease}
                      onChange={handleChange}
                      required
                      placeholder="Introduceți numele bolii"
                      className="h-11 bg-white text-gray-800 border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="flex items-center gap-2 font-medium text-gray-800">
                      <FiAlertCircle className="w-4 h-4 text-green-500" />
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as CaseStatus }))}
                    >
                      <SelectTrigger className="h-11 bg-white text-gray-800 border-gray-300">
                        <SelectValue placeholder="Selectează statusul" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value={CaseStatus.SUSPECTED}>Suspectat</SelectItem>
                        <SelectItem value={CaseStatus.CONFIRMED}>Confirmat</SelectItem>
                        <SelectItem value={CaseStatus.RECOVERED}>Recuperat</SelectItem>
                        <SelectItem value={CaseStatus.DECEASED}>Decedat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diagnosisDate" className="flex items-center gap-2 font-medium text-gray-800">
                      <FiCalendar className="w-4 h-4 text-green-500" />
                      Data Diagnosticării
                    </Label>
                    <Input
                      id="diagnosisDate"
                      name="diagnosisDate"
                      type="date"
                      value={formData.diagnosisDate}
                      onChange={handleChange}
                      required
                      className="h-11 bg-white text-gray-800 border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="locationId" className="flex items-center gap-2 font-medium text-gray-800">
                        <FiMapPin className="w-4 h-4 text-green-500" />
                        Locație
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/locations/new')}
                        className="text-xs flex items-center gap-1 text-blue-600"
                      >
                        <FiPlus className="h-3 w-3" /> Adaugă locație
                      </Button>
                    </div>
                    <Select
                      value={formData.locationId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}
                      required
                    >
                      <SelectTrigger className="h-11 bg-white text-gray-800 border-gray-300">
                        <SelectValue placeholder="Selectează locația" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {locations.length > 0 ? (
                          locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} - {location.city}, {location.county}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Nu există locații disponibile
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="flex items-center gap-2 font-medium text-gray-800">
                    <FiThermometer className="w-4 h-4 text-green-500" />
                    Simptome (separate prin virgulă)
                  </Label>
                  <Input
                    id="symptoms"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Febră, Durere de cap, Tuse"
                    className="h-11 bg-white text-gray-800 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2 font-medium text-gray-800">
                    <FiFileText className="w-4 h-4 text-green-500" />
                    Note adiționale
                  </Label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="flex h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Introduceți note adiționale (opțional)"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/cases')}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                  >
                    <FiList className="w-4 h-4" />
                    Anulează
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <FiPlus className="w-4 h-4" />
                    {loading ? 'Se salvează...' : 'Salvează Cazul'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 