import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import MainLayout from '../../components/layout/MainLayout';
import SimulationForm from '../../components/predictions/SimulationForm';
import OutbreakPredictionForm from '../../components/predictions/OutbreakPredictionForm';
import { SimulationResult, OutbreakPrediction } from '../../types/prediction';

const PredictionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'outbreak'>('simulation');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [outbreakPrediction, setOutbreakPrediction] = useState<OutbreakPrediction | null>(null);

  // Resetarea rezultatelor când se schimbă tabul
  useEffect(() => {
    if (activeTab === 'simulation') {
      setOutbreakPrediction(null);
    } else {
      setSimulationResult(null);
    }
  }, [activeTab]);

  return (
    <MainLayout>
      <Head>
        <title>Predicții | Sistem Gestionare Boli Infecțioase</title>
      </Head>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Predicții și Simulări</h1>
        <p className="mt-2 text-gray-600">
          Utilizați aceste instrumente pentru a simula răspândirea bolilor și pentru a prognoza potențiale focare.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === 'simulation'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('simulation')}
        >
          Simulare Răspândire
        </button>
        <button
          className={`ml-8 px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === 'outbreak'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('outbreak')}
        >
          Predicție Focare
        </button>
      </div>

      {/* Conținut tab activ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          {activeTab === 'simulation' ? (
            <SimulationForm onSimulationResult={setSimulationResult} />
          ) : (
            <OutbreakPredictionForm onPredictionResult={setOutbreakPrediction} />
          )}
        </div>

        <div className="md:col-span-2">
          {/* Rezultate simulare */}
          {activeTab === 'simulation' && simulationResult && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Rezultate Simulare pentru {simulationResult.location.name}
              </h2>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Parametri simulare</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-500">Model</span>
                    <span className="font-medium">{simulationResult.parameters.model || 'SIR'}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Populație</span>
                    <span className="font-medium">{simulationResult.location.population.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Infectați inițial</span>
                    <span className="font-medium">{simulationResult.parameters.initialInfected}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">R0</span>
                    <span className="font-medium">{simulationResult.parameters.r0}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Rată recuperare</span>
                    <span className="font-medium">{simulationResult.parameters.recoveryRate}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Zile simulate</span>
                    <span className="font-medium">{simulationResult.parameters.days}</span>
                  </div>
                </div>
              </div>
              
              <div className="h-80 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={simulationResult.results}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Zile', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis label={{ value: 'Persoane', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="susceptible" stroke="#8884d8" name="Susceptibili" />
                    {simulationResult.results[0].exposed !== undefined && (
                      <Line type="monotone" dataKey="exposed" stroke="#82ca9d" name="Expuși" />
                    )}
                    <Line type="monotone" dataKey="infected" stroke="#ff0000" name="Infectați" />
                    <Line type="monotone" dataKey="recovered" stroke="#00C49F" name="Recuperați" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Sumarul simulării */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Sumar simulare</h3>
                {(() => {
                  // Găsim vârful infecției
                  const peakInfection = simulationResult.results.reduce(
                    (max, point) => (point.infected > max.infected ? point : max),
                    { day: 0, infected: 0 }
                  );
                  
                  // Calculăm când infecția atinge pragul de 50% din vârf
                  const halfPeak = Math.floor(peakInfection.infected / 2);
                  let halfPeakDay = simulationResult.results.findIndex(
                    point => point.infected >= halfPeak
                  );
                  
                  return (
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li>
                        <strong>Vârf de infecție:</strong> Ziua {peakInfection.day} cu {peakInfection.infected.toLocaleString()} persoane infectate
                        ({(peakInfection.infected / simulationResult.location.population * 100).toFixed(2)}% din populație)
                      </li>
                      <li>
                        <strong>Creștere până la jumătate din vârf:</strong> {halfPeakDay} zile
                      </li>
                      <li>
                        <strong>Total persoane afectate:</strong> {simulationResult.results[simulationResult.results.length - 1].recovered.toLocaleString()} 
                        ({(simulationResult.results[simulationResult.results.length - 1].recovered / simulationResult.location.population * 100).toFixed(2)}% din populație)
                      </li>
                    </ul>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Rezultate predicție focar */}
          {activeTab === 'outbreak' && outbreakPrediction && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Predicție Focar pentru {outbreakPrediction.location.name}
              </h2>
              
              <div className="mb-6">
                <div className={`p-4 rounded-lg flex items-start ${
                  outbreakPrediction.prediction.riskLevel === 'HIGH' 
                    ? 'bg-red-50 text-red-700' 
                    : outbreakPrediction.prediction.riskLevel === 'MEDIUM'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-green-50 text-green-700'
                }`}>
                  <FiAlertTriangle className="mr-3 mt-0.5" size={18} />
                  <div>
                    <h3 className="font-medium">
                      Nivel de risc: {outbreakPrediction.prediction.riskLevel}
                    </h3>
                    <p className="text-sm mt-1">
                      {outbreakPrediction.prediction.riskLevel === 'HIGH' 
                        ? 'Risc ridicat de focar! Se recomandă măsuri preventive imediate.' 
                        : outbreakPrediction.prediction.riskLevel === 'MEDIUM'
                        ? 'Risc moderat. Se recomandă monitorizare atentă și pregătirea măsurilor preventive.'
                        : 'Risc scăzut. Continuați monitorizarea regulată.'
                      }
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Confidence:</span> {(outbreakPrediction.prediction.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Date istorice
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Perioada:</span>
                      <span className="font-medium">
                        {new Date(outbreakPrediction.historicalData.periodStart).toLocaleDateString()} - 
                        {new Date(outbreakPrediction.historicalData.periodEnd).toLocaleDateString()}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Total cazuri:</span>
                      <span className="font-medium">{outbreakPrediction.historicalData.totalCases}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Rată creștere:</span>
                      <span className={`font-medium ${
                        outbreakPrediction.historicalData.growthRate > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {(outbreakPrediction.historicalData.growthRate * 100).toFixed(1)}%
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Densitate cazuri:</span>
                      <span className="font-medium">{outbreakPrediction.historicalData.caseDensity.toFixed(2)}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    <span className="flex items-center">
                      <FiTrendingUp className="mr-2" />
                      Prognoză pentru 7 zile
                    </span>
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={outbreakPrediction.prediction.forecast}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="predictedCases"
                          stroke="#ff7300"
                          name="Cazuri prognozate"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Prognoză detaliată
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cazuri prognozate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {outbreakPrediction.prediction.forecast.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.date}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.predictedCases}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!simulationResult && !outbreakPrediction && (
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center h-64 text-gray-500">
              <p>
                {activeTab === 'simulation'
                  ? 'Completați formularul de simulare pentru a vedea rezultatele.'
                  : 'Selectați o locație pentru a vedea predicția de focar.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PredictionsPage;