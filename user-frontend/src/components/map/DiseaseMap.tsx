"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { GeospatialDataPoint } from '../../types/statistics';

// Fix pentru iconițele Leaflet în Next.js
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

interface DiseaseMapProps {
  data: GeospatialDataPoint[];
  mapType: 'heat' | 'markers';
}

// Extindem tipurile Leaflet pentru a include HeatLayer
declare module 'leaflet' {
  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: L.LatLngExpression[]): this;
    setOptions(options: any): this;
  }
  
  function heatLayer(latlngs: [number, number, number][], options?: any): HeatLayer;
}

const DiseaseMap: React.FC<DiseaseMapProps> = ({ data, mapType }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    fixLeafletIcons();
    
    // Inițializează harta dacă nu există deja
    if (!mapRef.current && mapContainerRef.current) {
      // Centrat pe România
      mapRef.current = L.map(mapContainerRef.current).setView([45.9443, 25.0094], 7);
      
      // Adaugă tile layer (Open Street Map)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
      
      // Inițializează layer groups pentru markeri și heat map
      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }
    
    return () => {
      // Cleanup la unmounting
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
        heatLayerRef.current = null;
      }
    };
  }, []);

  // Actualizează harta când se schimbă datele sau tipul de hartă
  useEffect(() => {
    if (!mapRef.current || !data.length) return;
    
    // Curăță layerele existente
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
    
    if (heatLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    
    if (mapType === 'markers') {
      // Adaugă markeri pentru fiecare locație
      data.forEach(point => {
        if (markersLayerRef.current) {
          const marker = L.marker([point.latitude, point.longitude])
            .bindPopup(`
              <div>
                <h3 style="font-weight: bold; margin-bottom: 5px;">${point.name}, ${point.city}</h3>
                <p>Județ: ${point.county}</p>
                <p>Cazuri: <strong>${point.count}</strong></p>
              </div>
            `);
          markersLayerRef.current.addLayer(marker);
        }
      });
    } else if (mapType === 'heat') {
      // Crează un nou heat layer
      const heatData = data.map(point => [
        point.latitude,
        point.longitude,
        point.count // intensitatea punctului depinde de numărul de cazuri
      ]) as [number, number, number][];
      
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        max: Math.max(...data.map(p => p.count)),
        gradient: {
          0.2: 'blue',
          0.4: 'lime',
          0.6: 'yellow',
          0.8: 'orange',
          1.0: 'red'
        }
      }).addTo(mapRef.current);
    }
  }, [data, mapType]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default DiseaseMap;