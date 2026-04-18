"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the map to avoid SSR issues with Leaflet
const FreeMap = dynamic(() => import("./FreeMap"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full w-full bg-muted/20">Loading Map...</div>
});

export default function MapWrapper({ pickup, dropoff }: { pickup: string; dropoff: string }) {
  return <FreeMap pickup={pickup} dropoff={dropoff} />;
}
