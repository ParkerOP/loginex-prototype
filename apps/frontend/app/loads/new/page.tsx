"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createLoad } from "../../../lib/api/loads";
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import MapWrapper from "../../../components/MapWrapper";
import AddressAutocomplete from "../../../components/AddressAutocomplete";

const libraries: "places"[] = ["places"];
const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi default

export default function NewLoadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickup: "",
    dropoff: "",
    cargo: "",
    vehicleType: "",
    weight: "",
  });

  // Free maps toggle logic
  const [useFreeMaps, setUseFreeMaps] = useState(false);

  useEffect(() => {
    // Enable free maps if explicitly requested via env var OR if Google API key is missing
    const useFreeMapsEnv = process.env.NEXT_PUBLIC_USE_FREE_MAPS === 'true';
    const hasGoogleKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (useFreeMapsEnv || !hasGoogleKey) {
        setUseFreeMaps(true);
    }
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);

  const originRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destRef = useRef<google.maps.places.Autocomplete | null>(null);

  const calculateRoute = async () => {
    if (useFreeMaps) return; // Free map routing is handled inside FreeMap component

    if (!formData.pickup || !formData.dropoff) return;

    // Skip real google API call if key is missing/dummy in prototype
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return;

    try {
      const directionsService = new google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: formData.pickup,
        destination: formData.dropoff,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirectionsResponse(results);
    } catch (error) {
      console.error("Failed to calculate route:", error);
    }
  };

  const handleOriginPlaceChanged = () => {
    if (originRef.current !== null) {
      const place = originRef.current.getPlace();
      const val = place.formatted_address || place.name || "";
      setFormData(prev => ({ ...prev, pickup: val }));
    }
  };

  const handleDestPlaceChanged = () => {
    if (destRef.current !== null) {
      const place = destRef.current.getPlace();
      const val = place.formatted_address || place.name || "";
      setFormData(prev => ({ ...prev, dropoff: val }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createLoad({
        shipperId: session?.user?.id || "dummy-shipper-123",
        originAddress: formData.pickup,
        originCity: formData.pickup.split(",")[0] || "Unknown",
        destinationAddress: formData.dropoff,
        destinationCity: formData.dropoff.split(",")[0] || "Unknown",
        cargoDescription: formData.cargo,
        requiredVehicleType: formData.vehicleType,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        scheduledTime: new Date().toISOString(), // Mock immediate schedule
      });
      router.push("/");
    } catch (error) {
      console.error("Failed to post load:", error);
      alert("Failed to post load. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/" passHref><Button variant="ghost" size="icon" >
            <ArrowLeft className="h-4 w-4" />
          </Button></Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Post New Load</h1>
          <p className="text-muted-foreground">
            Create a new requirement to find a driver.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Details</CardTitle>
              <CardDescription>Specify pickup and drop-off locations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Address</Label>
                {useFreeMaps ? (
                    <AddressAutocomplete
                      id="pickup"
                      placeholder="Search pickup location..."
                      value={formData.pickup}
                      onChange={(val: string) => setFormData(prev => ({ ...prev, pickup: val }))}
                    />
                ) : (
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                      {isLoaded ? (
                         <Autocomplete
                            onLoad={(autocomplete) => originRef.current = autocomplete}
                            onPlaceChanged={handleOriginPlaceChanged}
                         >
                           <Input
                             id="pickup"
                             placeholder="Search pickup location..."
                             className="pl-8"
                             value={formData.pickup}
                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, pickup: e.target.value})}
                             onBlur={calculateRoute}
                           />
                         </Autocomplete>
                      ) : (
                        <Input
                          id="pickup"
                          placeholder="Loading maps..."
                          className="pl-8"
                          disabled
                        />
                      )}
                    </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff">Drop-off Address</Label>
                {useFreeMaps ? (
                    <AddressAutocomplete
                      id="dropoff"
                      placeholder="Search drop-off location..."
                      value={formData.dropoff}
                      onChange={(val: string) => setFormData(prev => ({ ...prev, dropoff: val }))}
                    />
                ) : (
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                      {isLoaded ? (
                         <Autocomplete
                            onLoad={(autocomplete) => destRef.current = autocomplete}
                            onPlaceChanged={handleDestPlaceChanged}
                         >
                           <Input
                             id="dropoff"
                             placeholder="Search drop-off location..."
                             className="pl-8"
                             value={formData.dropoff}
                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, dropoff: e.target.value})}
                             onBlur={calculateRoute}
                           />
                         </Autocomplete>
                      ) : (
                        <Input
                          id="dropoff"
                          placeholder="Loading maps..."
                          className="pl-8"
                          disabled
                        />
                      )}
                    </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cargo & Vehicle Requirements</CardTitle>
              <CardDescription>What are you transporting?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo Description</Label>
                <Input
                  id="cargo"
                  placeholder="e.g., Electronics, Furniture, FMCG"
                  value={formData.cargo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, cargo: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle-type">Vehicle Type</Label>
                  <Select onValueChange={(val: string) => setFormData({...formData, vehicleType: val})}>
                    <SelectTrigger id="vehicle-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TATA_ACE">Tata Ace (Mini Truck)</SelectItem>
                      <SelectItem value="PICKUP">Pickup Truck</SelectItem>
                      <SelectItem value="14_FT">14-ft Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Approx. Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="500"
                    value={formData.weight}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={loading || !formData.pickup || !formData.dropoff || !formData.vehicleType}
              >
                {loading ? "Posting..." : "Post Load for Matching"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="rounded-lg border bg-muted/20 hidden md:flex items-center justify-center h-full min-h-[400px] overflow-hidden relative">
          {useFreeMaps ? (
              <>
                <MapWrapper pickup={formData.pickup} dropoff={formData.dropoff} />
                <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded shadow-sm z-10 border border-blue-200">
                    Using Free Map Alternative (OpenStreetMap)
                </div>
              </>
          ) : (
              <>
                  {isLoaded ? (
                     <GoogleMap
                       mapContainerStyle={{ width: '100%', height: '100%' }}
                       center={defaultCenter}
                       zoom={10}
                       onLoad={map => setMap(map)}
                     >
                       {directionsResponse && (
                         <DirectionsRenderer directions={directionsResponse} />
                       )}
                     </GoogleMap>
                  ) : (
                    <div className="text-center text-muted-foreground p-6">
                      <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                      <h3 className="font-medium text-lg">Loading Map...</h3>
                    </div>
                  )}
                  {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                     <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded shadow-sm z-10 border border-yellow-200">
                       Development Mode: API Key Missing
                     </div>
                  )}
              </>
          )}
        </div>
      </div>
    </div>
  );
}
