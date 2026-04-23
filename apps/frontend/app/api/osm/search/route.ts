import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  const limitParam = Number(request.nextUrl.searchParams.get("limit") || "5");
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 10)
    : 5;

  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=${limit}&countrycodes=in&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "LogineX-Prototype/1.0 (contact: support@loginex.local)",
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { suggestions: [], error: `Nominatim failed with ${response.status}` },
        { status: 200 },
      );
    }

    const rawData = (await response.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
    }>;

    const suggestions = Array.isArray(rawData)
      ? rawData.map((item) => ({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
        }))
      : [];

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json(
      {
        suggestions: [],
        error: error instanceof Error ? error.message : "OSM lookup failed",
      },
      { status: 200 },
    );
  }
}
