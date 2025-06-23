// src/pages/cases/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiMapPin, FiCalendar, FiUser, FiInfo } from 'react-icons/fi';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getCaseById } from '../../services/cases.service';
import { Case } from '../../types/case';
import { formatDate, getStatusBadgeClass } from '../../utils/date-utils';

const CaseDetailsPage: React.FC = () => {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchCaseDetails();
    }
  }, [id]);

  const fetchCaseDetails = async () => {
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

  if (loading) {
    return (
      <MainLayout title="Detalii Caz | Monitorizare Boli Infecțioase">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!caseData) {
    return (
      <MainLayout title="Caz Negăsit | Monitorizare Boli Infecțioase">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Cazul nu a fost găsit</h2>
              <p className="text-gray-600 mb-6">Cazul pe care îl căutați nu există sau a fost șters.</p>
              <Link href="/cases" passHref>
                <Button variant="primary">
                  Înapoi la Lista de Cazuri
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Caz ${caseData.disease} | Monitorizare Boli Infecțioase`}>
      <div className="bg-blue-700 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/cases" passHref>
              <Button 
                variant="outline" 
                className="mr-4 border-white text-white hover:bg-blue-600"
                size="sm"
              >
                <FiArrowLeft className="mr-1" />
                Înapoi
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{caseData.disease}</h1>
              <p className="mt-1">Detalii despre caz</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informații Generale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                  <div className="flex items-center">
                    <span 
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(caseData.status)}`}
                    >
                      {caseData.status}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="text-gray-500 mr-2" />
                    <span className="text-gray-700">{formatDate(caseData.diagnosisDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiMapPin className="text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      {caseData.location?.name}, {caseData.location?.county}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Simptome</h3>
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

                {caseData.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Note adiționale</h3>
                    <p className="text-gray-700 whitespace-pre-line">{caseData.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Despre {caseData.disease}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700">
                    Informațiile despre această boală sunt generice și informative. 
                    Pentru diagnostic și tratament, consultați întotdeauna un medic specialist.
                  </p>
                  
                  <DiseaseInfo diseaseName={caseData.disease} />
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FiInfo className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Datele prezentate sunt doar în scop informativ și educațional.
                          Pentru informații medicale precise, contactați autoritățile sanitare sau un medic.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Date Demografice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vârstă:</span>
                      <span className="font-medium">{caseData.age} ani</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gen:</span>
                      <span className="font-medium">{caseData.gender}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Locație</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">Nume:</span>
                      <span className="font-medium">{caseData.location?.name}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">Oraș:</span>
                      <span className="font-medium">{caseData.location?.city}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">Județ:</span>
                      <span className="font-medium">{caseData.location?.county}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">Țară:</span>
                      <span className="font-medium">{caseData.location?.country}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link href="/map" passHref>
                    <Button variant="outline" className="w-full">
                      <FiMapPin className="mr-2" />
                      Vezi pe hartă
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Informații Sistem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Pacient:</span>
                    <span className="font-mono">{caseData.patientId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Înregistrat la:</span>
                    <span>{formatDate(caseData.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actualizat la:</span>
                    <span>{formatDate(caseData.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Componentă pentru afișarea informațiilor despre boală
// În practică, aceasta ar putea prelua date dintr-o bază de date sau un API
interface DiseaseInfoProps {
  diseaseName: string;
}

const DiseaseInfo: React.FC<DiseaseInfoProps> = ({ diseaseName }) => {
  const diseaseInfoMap: Record<string, React.ReactNode> = {
    'COVID-19': (
      <>
        <h3>COVID-19</h3>
        <p>
          COVID-19 este o boală infecțioasă cauzată de coronavirusul SARS-CoV-2. 
          Primele cazuri au fost identificate în Wuhan, China, în decembrie 2019.
        </p>
        <h4>Simptome comune:</h4>
        <ul>
          <li>Febră</li>
          <li>Tuse uscată</li>
          <li>Oboseală</li>
          <li>Pierderea gustului sau mirosului</li>
        </ul>
        <h4>Prevenție:</h4>
        <ul>
          <li>Vaccinare</li>
          <li>Purtarea măștii</li>
          <li>Distanțare socială</li>
          <li>Igienă adecvată a mâinilor</li>
        </ul>
      </>
    ),
    'Gripă': (
      <>
        <h3>Gripă</h3>
        <p>
          Gripa este o infecție virală care afectează în principal tractul respirator.
          Este cauzată de virusurile gripale A, B, C și D.
        </p>
        <h4>Simptome comune:</h4>
        <ul>
          <li>Febră ridicată</li>
          <li>Dureri musculare</li>
          <li>Dureri de cap</li>
          <li>Tuse</li>
          <li>Oboseală</li>
        </ul>
        <h4>Prevenție:</h4>
        <ul>
          <li>Vaccinarea anuală</li>
          <li>Spălarea frecventă a mâinilor</li>
          <li>Evitarea contactului cu persoanele bolnave</li>
        </ul>
      </>
    ),
    'Tuberculoză': (
      <>
        <h3>Tuberculoză</h3>
        <p>
          Tuberculoza este o boală infecțioasă cauzată de bacteria Mycobacterium tuberculosis.
          Afectează în principal plămânii, dar poate afecta și alte părți ale corpului.
        </p>
        <h4>Simptome comune:</h4>
        <ul>
          <li>Tuse care durează mai mult de 3 săptămâni</li>
          <li>Tuse cu sânge</li>
          <li>Dureri toracice</li>
          <li>Pierdere în greutate</li>
          <li>Febră</li>
          <li>Transpirații nocturne</li>
        </ul>
        <h4>Tratament:</h4>
        <p>
          Tuberculoza este tratată cu antibiotice specifice pentru o perioadă de 6-9 luni.
          Este esențial ca tratamentul să fie urmat conform prescripției medicale.
        </p>
      </>
    ),
  };

  const defaultInfo = (
    <>
      <h3>{diseaseName}</h3>
      <p>
        Informații detaliate despre această boală nu sunt disponibile în baza noastră de date.
        Pentru informații specifice, vă rugăm să consultați resurse medicale specializate sau un medic.
      </p>
    </>
  );

  return (
    <div className="mt-4">
      {diseaseInfoMap[diseaseName] || defaultInfo}
    </div>
  );
};

export default CaseDetailsPage;