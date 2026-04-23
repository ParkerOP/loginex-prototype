"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

interface FreeMapProps {
  pickup: string;
  dropoff: string;
}

interface OsmSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const START_ICON = L.divIcon({
  className: "map-pin-start",
  html: '<div style="width:14px;height:14px;border-radius:999px;background:#16a34a;border:2px solid white;box-shadow:0 0 0 2px rgba(22,163,74,.35)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const END_ICON = L.divIcon({
  className: "map-pin-end",
  html: '<div style="width:14px;height:14px;border-radius:999px;background:#dc2626;border:2px solid white;box-shadow:0 0 0 2px rgba(220,38,38,.35)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function FreeMap({ pickup, dropoff }: FreeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      center: [28.6139, 77.209], // New Delhi
      zoom: 10,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const routeLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    routeLayerRef.current = routeLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      routeLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) {
      return;
    }

    let cancelled = false;

    const clearRoute = () => {
      if (routeLayerRef.current) {
        routeLayerRef.current.clearLayers();
      }
    };

    const geocode = async (address: string) => {
      const response = await fetch(
        `/api/osm/search?q=${encodeURIComponent(address)}&limit=1`,
      );
      const payload = await response.json();
      const suggestions = (payload?.suggestions || []) as OsmSuggestion[];
      const firstSuggestion = suggestions[0];
      if (!firstSuggestion) {
        return null;
      }
      return L.latLng(Number(firstSuggestion.lat), Number(firstSuggestion.lon));
    };

    const updateRoute = async () => {
      clearRoute();

      if (!pickup || !dropoff) {
        return;
      }

      try {
        const [start, end] = await Promise.all([geocode(pickup), geocode(dropoff)]);
        if (cancelled || !start || !end || !routeLayerRef.current || !mapRef.current) {
          return;
        }

        const routeResponse = await fetch(
          `/api/osm/route?startLat=${start.lat}&startLon=${start.lng}&endLat=${end.lat}&endLon=${end.lng}`,
        );
        const routePayload = await routeResponse.json();
        const coordinates = Array.isArray(routePayload?.coordinates)
          ? (routePayload.coordinates as [number, number][])
          : [];

        const polylinePoints =
          coordinates.length >= 2
            ? coordinates
            : ([
                [start.lat, start.lng],
                [end.lat, end.lng],
              ] as [number, number][]);

        const polyline = L.polyline(polylinePoints, {
          color: "#2563eb",
          weight: 5,
          opacity: 0.88,
        });

        const startMarker = L.marker([start.lat, start.lng], {
          icon: START_ICON,
        }).bindPopup("Pickup");
        const endMarker = L.marker([end.lat, end.lng], {
          icon: END_ICON,
        }).bindPopup("Drop-off");

        const currentRouteLayer = routeLayerRef.current;
        const currentMap = mapRef.current;
        if (!currentRouteLayer || !currentMap) {
          return;
        }

        currentRouteLayer.addLayer(polyline);
        currentRouteLayer.addLayer(startMarker);
        currentRouteLayer.addLayer(endMarker);
        currentMap.fitBounds(polyline.getBounds(), {
          padding: [24, 24],
          maxZoom: 14,
        });
      } catch (error) {
        if (!cancelled) {
          clearRoute();
          console.error("OSM route rendering error:", error);
        }
      }
    };

    void updateRoute();

    return () => {
      cancelled = true;
      clearRoute();
    };
  }, [pickup, dropoff]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", width: "100%", minHeight: "400px" }}
    />
  );
}
