"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import io from "socket.io-client";
import dynamic from 'next/dynamic';

// Dynamic import for leaflet map to avoid SSR issues
const Map = dynamic(
  () => import('../../../components/Map'), // We'll create this component
  { ssr: false, loading: () => <div className="h-64 bg-muted/30 flex items-center justify-center animate-pulse">Loading Map...</div> }
);

interface LocationPing {
  id: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export default function LoadDetailsPage() {
  const params = useParams();
  const id = params.id as string;


  const [pings, setPings] = useState<LocationPing[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // 1. Fetch historical pings
    const fetchPings = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
        const res = await fetch(`${baseUrl}/trips/${id}/pings`);
        if (res.ok) {
          const data = await res.json();
          setPings(data);
          if (data.length > 0) {
            const last = data[data.length - 1];
            setCurrentLocation({ lat: last.latitude, lng: last.longitude });
          }
        }
      } catch (err) {
        console.error("Failed to fetch historical pings", err);
      }
    };
    fetchPings();

    // 2. Setup WebSocket connection
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/v1/trips/tracking";
    const newSocket = io(socketUrl);


    newSocket.on('connect', () => {
      console.log('Connected to websocket');
      newSocket.emit('joinTrip', { tripId: id });
    });

    newSocket.on('locationUpdate', (ping: LocationPing) => {
      console.log('Received location update', ping);
      setPings(prev => [...prev, ping]);
      setCurrentLocation({ lat: ping.latitude, lng: ping.longitude });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/" passHref><Button variant="ghost" size="icon" >
            <ArrowLeft className="h-4 w-4" />
          </Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Trip #{id || "123"}</h1>
            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">In Transit</Badge>
          </div>
          <p className="text-muted-foreground">
            Warehouse A to Retail Store
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Tracking and Driver Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            {/* Live Tracking Map */}
            <div className="h-64 border-b relative">
              <Map currentLocation={currentLocation} path={pings} />

              <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm border rounded-lg p-3 flex justify-between items-center shadow-sm z-[1000]">
                 <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Estimated Arrival</p>
                    <p className="font-bold text-lg">14:30 PM</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Distance Left</p>
                    <p className="font-bold text-lg">4.2 km</p>
                 </div>
              </div>
            </div>
            <CardContent className="p-6">
               <h3 className="font-semibold mb-4 text-lg">Driver Details</h3>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src="" />
                      <AvatarFallback>RK</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Raj Kumar</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>4.8 ★</span>
                        <span>•</span>
                        <span>Tata Ace (KA-01-AB-1234)</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Call Driver
                  </Button>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
               <CardTitle>Trip Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1"><CheckCircle2 className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="font-medium">Load Picked Up</p>
                    <p className="text-sm text-muted-foreground">Warehouse A, Industrial Area • 10:15 AM</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1"><AlertCircle className="h-5 w-5 text-blue-500" /></div>
                  <div>
                    <p className="font-medium">In Transit</p>
                    <p className="text-sm text-muted-foreground">Current Status • {pings.length > 0 ? "Live Tracking" : "Waiting for updates"}</p>
                  </div>
                </div>
                <div className="flex gap-4 opacity-50">
                  <div className="mt-1"><MapPin className="h-5 w-5" /></div>
                  <div>
                    <p className="font-medium">Expected Delivery</p>
                    <p className="text-sm text-muted-foreground">Retail Store, City Center • Est. 14:30 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order details & Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Cargo</p>
                <p className="font-medium">Electronics • 800 kg</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span>₹1,200.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span>₹180.00</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span>₹1,380.00</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-6 flex flex-col items-stretch gap-4">
               <div className="text-center space-y-1">
                 <p className="text-sm font-medium">Payment Pending</p>
                 <p className="text-xs text-muted-foreground">Invoice will be generated upon delivery confirmation.</p>
               </div>
               <Button className="w-full" disabled>
                 Pay via Razorpay (Disabled until POD)
               </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
