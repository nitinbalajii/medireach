"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Component to dynamically fit bounds of both markers
function MapBounds({ patientPos, hospitalPos }) {
  const map = useMap();
  useEffect(() => {
    if (patientPos && hospitalPos) {
      const bounds = L.latLngBounds([patientPos, hospitalPos]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (patientPos) {
      map.setView(patientPos, 14);
    }
  }, [map, patientPos, hospitalPos]);
  return null;
}

export default function LiveMap({ patientCoords, hospitalCoords }) {
  const defaultCenter = [28.6139, 77.2090]; // New Delhi
  
  const patientPos = patientCoords ? [patientCoords.latitude, patientCoords.longitude] : null;
  const hospitalPos = hospitalCoords ? [hospitalCoords.latitude, hospitalCoords.longitude] : null;
  const center = patientPos || defaultCenter;

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 10 }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {patientPos && (
        <Marker position={patientPos}>
          <Popup>Patient Location</Popup>
        </Marker>
      )}
      
      {hospitalPos && (
        <Marker position={hospitalPos}>
          <Popup>Dispatched Hospital</Popup>
        </Marker>
      )}

      {patientPos && hospitalPos && (
        <Polyline positions={[patientPos, hospitalPos]} color="red" dashArray="10, 10" weight={4}>
          <Popup>Ambulance Route</Popup>
        </Polyline>
      )}
      
      <MapBounds patientPos={patientPos} hospitalPos={hospitalPos} />
    </MapContainer>
  );
}
