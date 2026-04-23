"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in react-leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom truck icon
const TruckIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/713/713311.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface LocationPing {
  latitude: number;
  longitude: number;
}

interface MapProps {
  currentLocation: { lat: number; lng: number } | null;
  path: LocationPing[];
}

export default function Map({ currentLocation, path }: MapProps) {
  const defaultCenter: [number, number] = [12.9716, 77.5946]; // Bangalore
  const center: [number, number] = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : defaultCenter;

  const polylinePositions: [number, number][] = path.map((p) => [
    p.latitude,
    p.longitude,
  ]);

  return (
    <div style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            color="blue"
            weight={4}
            opacity={0.6}
          />
        )}

        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={TruckIcon}
          >
            <Popup>Current Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
