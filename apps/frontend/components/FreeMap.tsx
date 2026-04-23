"use client";

import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface FreeMapProps {
  pickup: string;
  dropoff: string;
}

const RoutingMachine = ({
  pickup,
  dropoff,
}: {
  pickup: string;
  dropoff: string;
}) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!pickup || !dropoff) {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      return;
    }

    const geocode = async (address: string) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        );
        const data = await response.json();
        if (data && data.length > 0) {
          return L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
      return null;
    };

    const setupRouting = async () => {
      const start = await geocode(pickup);
      const end = await geocode(dropoff);

      if (start && end) {
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current);
        }

        routingControlRef.current = L.Routing.control({
          waypoints: [start, end],
          lineOptions: {
            styles: [{ color: "#6366F1", weight: 4 }],
            extendToWaypoints: true,
            missingRouteTolerance: 0,
          },
          show: false,
          addWaypoints: false,
          routeWhileDragging: false,
          fitSelectedRoutes: true,
          showAlternatives: false,
        }).addTo(map);
      }
    };

    setupRouting();

    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [pickup, dropoff, map]);

  return null;
};

export default function FreeMap({ pickup, dropoff }: FreeMapProps) {
  const defaultCenter: L.LatLngExpression = [28.6139, 77.209]; // New Delhi
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div style={{ height: "100%", width: "100%", minHeight: "400px" }}>
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RoutingMachine pickup={pickup} dropoff={dropoff} />
      </MapContainer>
    </div>
  );
}
