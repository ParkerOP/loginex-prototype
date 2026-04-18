"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createLoad } from "../../../lib/api/loads";

export default function NewLoadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickup: "",
    dropoff: "",
    cargo: "",
    vehicleType: "",
    weight: "",
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Ensure we have a dummy shipper ID for prototype
      // In a real app this comes from auth context
      await createLoad({
        shipperId: "dummy-shipper-123",
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
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pickup"
                    placeholder="Enter pickup location"
                    className="pl-8"
                    value={formData.pickup}
                    onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff">Drop-off Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dropoff"
                    placeholder="Enter drop-off location"
                    className="pl-8"
                    value={formData.dropoff}
                    onChange={(e) => setFormData({...formData, dropoff: e.target.value})}
                  />
                </div>
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
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle-type">Vehicle Type</Label>
                  <Select onValueChange={(val) => setFormData({...formData, vehicleType: val as string})}>
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
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
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

        {/* Placeholder for Google Maps Route Visualization */}
        <div className="rounded-lg border bg-muted/20 hidden md:flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center text-muted-foreground p-6">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium text-lg">Map Route Visualization</h3>
            <p className="text-sm">
              (Google Maps integration will display the calculated route and estimated distance here once locations are entered.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
