'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import dynamic from 'next/dynamic';

// Fixăm problema cu iconițele Leaflet în Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Interfața pentru geocodare
interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    locality?: string;
    municipality?: string;
    state_district?: string;
  };
}

interface LocationMapProps {
  onLocationSelect: (data: {
    latitude: number;
    longitude: number;
    name: string;
    city: string;
    county: string;
    country: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    name: string;
    city: string;
    county: string;
    country: string;
  };
  disabled?: boolean;
}

// Componenta pentru evenimentele hărții
function MapEvents({ onMapClick, disabled }: { onMapClick: (lat: number, lng: number) => void; disabled?: boolean }) {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

const LocationMap: React.FC<LocationMapProps> = ({
  onLocationSelect,
  initialLocation,
  disabled = false,
}) => {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Centrează harta pe România
  const center: [number, number] = initialLocation 
    ? [initialLocation.latitude, initialLocation.longitude] 
    : [45.9443, 25.0094];
  const zoom = initialLocation ? 10 : 7;

  const handleMapClick = async (lat: number, lng: number) => {
    if (disabled) return;
    
    setIsLoading(true);
    setPosition([lat, lng]);
    
    try {
      // Folosim OpenStreetMap Nominatim pentru reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=ro`
      );
      
      if (!response.ok) {
        throw new Error('Eroare la geocodare inversă');
      }
      
      const data: GeocodingResult = await response.json();
      
      // Detectăm orașul mai corect, încercând toate posibilitățile
      const city = data.address.city || 
                 data.address.town || 
                 data.address.village || 
                 data.address.hamlet || 
                 data.address.locality || 
                 data.address.municipality || 
                 '';
                 
      // Tratăm cazul special pentru București
      let county = '';
      if (city === 'București' || city.includes('București') || city.includes('Bucharest')) {
        county = 'București';
      } else {
        county = data.address.county || data.address.state_district || data.address.state || '';
      }
      
      const country = data.address.country || 'România';
      const name = data.display_name.split(',')[0] || '';
      
      // Trimitem informațiile către componenta părinte
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        name,
        city,
        county,
        country,
      });
    } catch (error) {
      console.error('Eroare la obținerea datelor locației:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
          <span className="text-blue-600">Se încarcă informațiile locației...</span>
        </div>
      )}
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', cursor: disabled ? 'default' : 'crosshair' }}
        scrollWheelZoom={true}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onMapClick={handleMapClick} disabled={disabled} />
        {position && <Marker position={position} />}
      </MapContainer>
    </div>
  );
};

// Exportăm componenta cu încărcare dinamică pentru a evita erorile de SSR cu Leaflet
export default dynamic(() => Promise.resolve(LocationMap), {
  ssr: false,
}); 