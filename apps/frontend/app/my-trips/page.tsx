"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchApi } from "@/lib/api/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  proofOfDelivery?: { id: string } | null;
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

  // POD Modal State
  const [podModalOpen, setPodModalOpen] = useState(false);
  const [podTripId, setPodTripId] = useState<string | null>(null);
  const [podFile, setPodFile] = useState<File | null>(null);
  const [podNotes, setPodNotes] = useState("");
  const [submittingPod, setSubmittingPod] = useState(false);

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

  const openPodModal = (tripId: string) => {
    setPodTripId(tripId);
    setPodFile(null);
    setPodNotes("");
    setPodModalOpen(true);
  };

  const handleSubmitPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podTripId || !podFile) return;

    setSubmittingPod(true);
    try {
      const formData = new FormData();
      formData.append("file", podFile);
      if (podNotes) {
        formData.append("notes", podNotes);
      }
      formData.append("driverId", session!.user.id);

      // fetchApi defaults to application/json if we don't override.
      // But actually, fetch API handles FormData automatically if we omit Content-Type.
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
      const response = await fetch(`${baseUrl}/trips/${podTripId}/pod`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(session as unknown as { accessToken?: string })?.accessToken}`, // Cast to fix missing type definition
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit POD");
      }

      toast.success("Proof of Delivery submitted successfully");
      setPodModalOpen(false);
      fetchTrips(); // Refresh the list to update POD status
    } catch (error: unknown) {
      console.error("Failed to submit POD", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit POD";
      toast.error(errorMessage);
    } finally {
      setSubmittingPod(false);
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
            const canSubmitPod = (trip.status === "ARRIVED" || trip.status === "DELIVERED") && !trip.proofOfDelivery;

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

                  {canSubmitPod && (
                    <Button
                      variant="outline"
                      className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                      onClick={() => openPodModal(trip.id)}
                    >
                      Submit POD
                    </Button>
                  )}

                  {trip.proofOfDelivery && (
                    <Badge variant="outline" className="w-full justify-center bg-green-50 text-green-700 border-green-200 py-1.5">
                      POD Submitted
                    </Badge>
                  )}

                  {trip.status === "DELIVERED" && !canSubmitPod && !trip.proofOfDelivery && (
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

      {/* POD Submission Modal */}
      <Dialog open={podModalOpen} onOpenChange={setPodModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Proof of Delivery</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPod} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="podImage">Image</Label>
              <Input
                id="podImage"
                type="file"
                accept="image/*"
                onChange={(e) => setPodFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="podNotes">Delivery Notes (Optional)</Label>
              <Textarea
                id="podNotes"
                placeholder="E.g., Left with security guard"
                value={podNotes}
                onChange={(e) => setPodNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPodModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!podFile || submittingPod}>
                {submittingPod ? "Submitting..." : "Submit POD"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
