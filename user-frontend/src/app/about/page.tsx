"use client";

import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { FiAlertCircle, FiShield, FiThumbsUp, FiInfo } from 'react-icons/fi';

const AboutPage: React.FC = () => {
  return (
    <MainLayout title="Despre Aplicație | Monitorizare Boli Infecțioase">
      <div className="bg-blue-700 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Despre Aplicație</h1>
          <p className="mt-2">Informații despre platforma de monitorizare și măsuri de prevenție</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Platforma de Monitorizare a Bolilor Infecțioase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Platforma noastră a fost creată pentru a centraliza informațiile despre cazurile de boli infecțioase,
                oferind acces ușor la date actualizate atât pentru publicul larg, cât și pentru profesioniștii din domeniul sănătății.
              </p>
              <p className="text-gray-700 mb-4">
                Prin intermediul acestei platforme, utilizatorii pot:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Vizualiza statistici actualizate privind bolile infecțioase</li>
                <li>Explora distribuția geografică a cazurilor pe hartă</li>
                <li>Accesa informații detaliate despre cazurile înregistrate</li>
                <li>Obține informații utile despre prevenția bolilor infecțioase</li>
              </ul>
              <p className="text-gray-700">
                Platforma utilizează tehnologii moderne pentru a prezenta datele într-un mod intuitiv și interactiv,
                facilitând înțelegerea evoluției bolilor infecțioase și sprijinind măsurile de prevenție
                și control.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700">
                  <FiAlertCircle className="mr-2" />
                  Simptome
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Recunoașterea simptomelor comune pentru bolile infecțioase este esențială pentru
                  diagnosticarea și tratarea promptă a acestora.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Febră persistentă</li>
                  <li>Tuse și dificultăți de respirație</li>
                  <li>Oboseală neobișnuită</li>
                  <li>Dureri musculare și articulare</li>
                  <li>Erupții cutanate</li>
                  <li>Dureri în gât</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <FiShield className="mr-2" />
                  Prevenție
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Măsurile de prevenție pot reduce semnificativ riscul de infectare și răspândire
                  a bolilor infecțioase.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Spălarea frecventă a mâinilor</li>
                  <li>Evitarea contactului apropiat cu persoanele bolnave</li>
                  <li>Acoperirea gurii și nasului când tușiți sau strănutați</li>
                  <li>Vaccinarea conform recomandărilor medicale</li>
                  <li>Curățarea și dezinfectarea suprafețelor frecvent atinse</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <FiThumbsUp className="mr-2" />
                  Tratament
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  În cazul apariției simptomelor, este important să:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Consultați un medic pentru diagnostic corect</li>
                  <li>Urmați tratamentul prescris</li>
                  <li>Odihniți-vă suficient</li>
                  <li>Consumați lichide adecvate</li>
                  <li>Izolați-vă pentru a preveni răspândirea bolii</li>
                  <li>Monitorizați evoluția simptomelor</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informații Utile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Bolile infecțioase comune</h3>
                  <p className="text-gray-700 mb-2">
                    Bolile infecțioase sunt cauzate de microorganisme patogene precum bacterii, viruși, paraziți sau fungi.
                    Printre cele mai comune se numără:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                    <li>Infecții respiratorii (gripă, COVID-19, pneumonie)</li>
                    <li>Gastroenterite (intoxicații alimentare, infecții intestinale)</li>
                    <li>Infecții cutanate</li>
                    <li>Tuberculoză</li>
                    <li>Infecții cu transmitere sexuală</li>
                    <li>Boli cu transmitere prin vectori (malarie, boala Lyme)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Grupuri cu risc crescut</h3>
                  <p className="text-gray-700 mb-2">
                    Anumite grupuri de persoane au un risc mai mare de a dezvolta forme severe ale bolilor infecțioase:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                    <li>Vârstnici (peste 65 de ani)</li>
                    <li>Copii mici (sub 5 ani)</li>
                    <li>Persoane cu sistem imunitar slăbit</li>
                    <li>Persoane cu boli cronice (diabet, boli cardiovasculare)</li>
                    <li>Femei însărcinate</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Resurse utile</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>
                      <a 
                        href="https://www.ms.ro/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ministerul Sănătății
                      </a>
                      {' '}- Informații oficiale și recomandări
                    </li>
                    <li>
                      <a 
                        href="https://www.who.int/ro" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Organizația Mondială a Sănătății
                      </a>
                      {' '}- Ghiduri și informații globale
                    </li>
                    <li>
                      <a 
                        href="https://www.ecdc.europa.eu/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Centrul European de Prevenire a Bolilor
                      </a>
                      {' '}- Date și statistici la nivel european
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiInfo className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Această platformă are scop informativ și educațional. Pentru sfaturi medicale personalizate,
                        vă rugăm să consultați un medic sau alt profesionist din domeniul sănătății.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;