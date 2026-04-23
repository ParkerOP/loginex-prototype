"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTripsByDriver, Trip, updateTripStatus } from "@/lib/api/trips";
import { fetchApi } from "@/lib/api/client";
import { toast } from "sonner";

const statusSteps: Record<string, Array<"IN_TRANSIT" | "ARRIVED" | "DELIVERED">> = {
  STARTED: ["IN_TRANSIT"],
  IN_TRANSIT: ["ARRIVED"],
  ARRIVED: ["DELIVERED"],
  DELIVERED: [],
};

export default function MyTripsPage() {
  const { data: session } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTripId, setUpdatingTripId] = useState<string | null>(null);
  const [podFiles, setPodFiles] = useState<Record<string, File | null>>({});
  const [podNotes, setPodNotes] = useState<Record<string, string>>({});
  const isDriver = (session?.user as { role?: string })?.role === "DRIVER";

  const refreshTrips = () => {
    if (!session?.user?.id || !isDriver) {
      setLoading(false);
      return;
    }

    getTripsByDriver(session.user.id, session)
      .then((data) => setTrips(data || []))
      .catch((error) => console.error("Failed to fetch trips", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isDriver]);

  const activeTrips = useMemo(
    () => trips.filter((trip) => trip.status !== "DELIVERED"),
    [trips],
  );
  const completedTrips = useMemo(
    () => trips.filter((trip) => trip.status === "DELIVERED"),
    [trips],
  );

  const handleAdvance = async (
    tripId: string,
    nextStatus: "IN_TRANSIT" | "ARRIVED" | "DELIVERED",
  ) => {
    if (!session?.user?.id) {
      return;
    }

    try {
      setUpdatingTripId(tripId);
      await updateTripStatus(tripId, session.user.id, nextStatus, session);
      toast.success(`Trip moved to ${nextStatus}`);
      refreshTrips();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update trip status");
    } finally {
      setUpdatingTripId(null);
    }
  };

  const handlePodSubmit = async (tripId: string) => {
    if (!session?.user?.id || !podFiles[tripId]) {
      toast.error("Please select a POD image first");
      return;
    }

    try {
      setUpdatingTripId(tripId);
      const formData = new FormData();
      formData.append("file", podFiles[tripId] as File);
      formData.append("driverId", session.user.id);
      formData.append("notes", podNotes[tripId] || "");
      await fetchApi(`/trips/${tripId}/pod`, {
        method: "POST",
        session,
        body: formData,
      });
      toast.success("POD submitted successfully");
      refreshTrips();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit POD");
    } finally {
      setUpdatingTripId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          My Trips
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Live trip execution and completion timeline.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Trips</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{activeTrips.length}</CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed Trips</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{completedTrips.length}</CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Trip List</CardTitle>
          <CardDescription>Manage state transitions for assigned deliveries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading trips...</p>}
          {!loading && !isDriver && (
            <p className="text-sm text-muted-foreground">
              Trip management is available for driver accounts.
            </p>
          )}
          {!loading && isDriver && trips.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No assigned trips yet. Accept a load from Find Loads.
            </p>
          )}
          {!loading &&
            trips.map((trip) => {
              const nextStatuses = statusSteps[trip.status] || [];
              return (
                <div
                  key={trip.id}
                  className="rounded-lg border border-border/60 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {trip.booking?.load?.originCity || "Unknown"} to{" "}
                        {trip.booking?.load?.destinationCity || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Trip {trip.id.slice(0, 8)} |{" "}
                        {trip.booking?.load?.requiredVehicleType || "N/A"}
                      </p>
                    </div>
                    <Badge variant="outline">{trip.status}</Badge>
                  </div>
                  {nextStatuses.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {nextStatuses.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAdvance(trip.id, status)}
                          disabled={updatingTripId === trip.id}
                        >
                          Mark {status}
                        </Button>
                      ))}
                    </div>
                  )}
                  {(trip.status === "ARRIVED" || trip.status === "DELIVERED") && (
                    <div className="space-y-2 pt-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setPodFiles((prev) => ({
                            ...prev,
                            [trip.id]: event.target.files?.[0] || null,
                          }))
                        }
                        className="text-xs"
                      />
                      <input
                        type="text"
                        placeholder="POD notes (optional)"
                        value={podNotes[trip.id] || ""}
                        onChange={(event) =>
                          setPodNotes((prev) => ({
                            ...prev,
                            [trip.id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handlePodSubmit(trip.id)}
                        disabled={updatingTripId === trip.id}
                      >
                        Submit POD
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}
