"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchApi } from "@/lib/api/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Load {
  id: string;
  originCity: string;
  originAddress: string;
  destinationCity: string;
  destinationAddress: string;
  cargoDescription: string;
}

interface Booking {
  id: string;
  load: Load;
}

interface Trip {
  id: string;
  status: string;
  booking: Booking;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  STARTED: ["IN_TRANSIT"],
  IN_TRANSIT: ["ARRIVED"],
  ARRIVED: ["DELIVERED"],
  DELIVERED: [],
};

const STATUS_LABELS: Record<string, string> = {
  STARTED: "Trip Started",
  IN_TRANSIT: "In Transit",
  ARRIVED: "Arrived",
  DELIVERED: "Delivered",
};

const ACTION_LABELS: Record<string, string> = {
  IN_TRANSIT: "Start Driving",
  ARRIVED: "Mark as Arrived",
  DELIVERED: "Complete Delivery",
};

export default function MyTripsPage() {
  const { data: session } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTrips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await fetchApi(`/trips/driver/${session!.user.id}`, { session });
      setTrips(response || []);
    } catch (error) {
      console.error("Failed to fetch trips", error);
      toast.error("Failed to load your trips");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (tripId: string, nextStatus: string) => {
    setUpdating(tripId);
    try {
      await fetchApi(`/trips/${tripId}/status`, {
        method: "PUT",
        session,
        body: JSON.stringify({ status: nextStatus, driverId: session!.user.id }),
      });
      toast.success(`Trip status updated to ${STATUS_LABELS[nextStatus]}`);
      fetchTrips(); // Refresh the list
    } catch (error: unknown) {
      console.error("Failed to update status", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update trip status";
      toast.error(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  if (!session) {
    return <div>Please log in to view your trips.</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Trips</h1>
      </div>

      {loading ? (
        <div className="text-center p-8">Loading trips...</div>
      ) : trips.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          <p>You don&apos;t have any active or completed trips.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => {
            const load = trip.booking.load;
            const nextStatuses = VALID_TRANSITIONS[trip.status] || [];

            return (
              <Card key={trip.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span>{load.originCity} ➔ {load.destinationCity}</span>
                      <Badge variant={trip.status === "DELIVERED" ? "secondary" : "default"}>
                        {STATUS_LABELS[trip.status] || trip.status}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2 flex-grow">
                  <p><strong>Cargo:</strong> {load.cargoDescription}</p>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <p><strong>From:</strong> {load.originAddress}</p>
                    <p><strong>To:</strong> {load.destinationAddress}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  {nextStatuses.map((nextStatus) => (
                    <Button
                      key={nextStatus}
                      className="w-full"
                      onClick={() => handleUpdateStatus(trip.id, nextStatus)}
                      disabled={updating === trip.id}
                    >
                      {updating === trip.id ? "Updating..." : ACTION_LABELS[nextStatus] || "Update Status"}
                    </Button>
                  ))}
                  {trip.status === "DELIVERED" && (
                     <Button variant="outline" className="w-full" disabled>
                       Completed
                     </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
