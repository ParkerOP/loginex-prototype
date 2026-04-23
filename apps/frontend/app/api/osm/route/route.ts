import { NextRequest, NextResponse } from "next/server";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

function toNumber(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: NextRequest) {
  const startLat = toNumber(request.nextUrl.searchParams.get("startLat"));
  const startLon = toNumber(request.nextUrl.searchParams.get("startLon"));
  const endLat = toNumber(request.nextUrl.searchParams.get("endLat"));
  const endLon = toNumber(request.nextUrl.searchParams.get("endLon"));

  if (startLat === null || startLon === null || endLat === null || endLon === null) {
    return NextResponse.json(
      { coordinates: [], distanceMeters: 0, durationSeconds: 0 },
      { status: 200 },
    );
  }

  const url = `${OSRM_URL}/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "LogineX-Prototype/1.0 (contact: support@loginex.local)",
        Accept: "application/json",
      },
      next: { revalidate: 10 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { coordinates: [[startLat, startLon], [endLat, endLon]], distanceMeters: 0, durationSeconds: 0 },
        { status: 200 },
      );
    }

    const data = await response.json();
    const route = data?.routes?.[0];
    const geometry = route?.geometry?.coordinates as [number, number][] | undefined;
    const coordinates = Array.isArray(geometry)
      ? geometry.map(([lon, lat]) => [lat, lon])
      : [[startLat, startLon], [endLat, endLon]];

    return NextResponse.json({
      coordinates,
      distanceMeters: Number(route?.distance || 0),
      durationSeconds: Number(route?.duration || 0),
    });
  } catch {
    return NextResponse.json(
      { coordinates: [[startLat, startLon], [endLat, endLon]], distanceMeters: 0, durationSeconds: 0 },
      { status: 200 },
    );
  }
}
