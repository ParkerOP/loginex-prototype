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
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, CheckCircle2, UploadCloud, Truck, Box } from "lucide-react";
import { usePerformance } from "@/components/providers/performance-context";

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
  const { data: session, status } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  // POD Modal State
  const [podModalOpen, setPodModalOpen] = useState(false);
  const [podTripId, setPodTripId] = useState<string | null>(null);
  const [podFile, setPodFile] = useState<File | null>(null);
  const [podNotes, setPodNotes] = useState("");
  const [submittingPod, setSubmittingPod] = useState(false);
  const { reduceMotion } = usePerformance();

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

  if (status === "loading" || !session) {
    return (
      <div className="flex h-64 items-center justify-center">
         <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
         />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={reduceMotion ? {} : containerVariants}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground mt-1">Manage your active routes and deliveries.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <Card key={i} className="glass-card animate-pulse h-64 border-white/5" />
           ))}
        </div>
      ) : trips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl border-dashed border-2 border-white/10"
        >
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
             <Truck className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No active trips</h3>
          <p className="text-muted-foreground mt-2 max-w-md">You do not have any active or completed trips yet. Find and accept a load to get started.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {trips.map((trip) => {
              const load = trip.booking.load;
              const nextStatuses = VALID_TRANSITIONS[trip.status] || [];
              const canSubmitPod = (trip.status === "ARRIVED" || trip.status === "DELIVERED") && !trip.proofOfDelivery;

              return (
                <motion.div
                  key={trip.id}
                  variants={reduceMotion ? {} : itemVariants}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                  className="group h-full"
                >
                  <Card className="glass-card h-full flex flex-col border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
                    {/* Background Progress Indicator based on Status */}
                    <div className="absolute top-0 left-0 h-1 bg-muted w-full overflow-hidden">
                       <motion.div
                          className={`h-full ${
                             trip.status === "DELIVERED" ? "bg-green-500" :
                             trip.status === "ARRIVED" ? "bg-amber-500 w-3/4" :
                             trip.status === "IN_TRANSIT" ? "bg-primary w-1/2" :
                             "bg-primary w-1/4"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: trip.status === "DELIVERED" ? "100%" : trip.status === "ARRIVED" ? "75%" : trip.status === "IN_TRANSIT" ? "50%" : "25%" }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                       />
                    </div>

                    <CardHeader className="pb-3 border-b border-white/5 mt-1">
                      <div className="flex justify-between items-start mb-2">
                        <Badge
                           variant={trip.status === "DELIVERED" ? "secondary" : "default"}
                           className={trip.status === "IN_TRANSIT" ? "animate-pulse" : ""}
                        >
                          {STATUS_LABELS[trip.status] || trip.status}
                        </Badge>
                      </div>
                      <CardTitle className="flex flex-col gap-2 text-lg">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{load.originCity}</span>
                        </div>
                        <div className="pl-2 border-l-2 border-muted-foreground/30 ml-1.5 h-3" />
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-primary" />
                          <span className="truncate">{load.destinationCity}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-4 pt-4 flex-1">
                      <div>
                         <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Cargo Details</p>
                         <p className="font-medium flex items-start gap-2">
                            <Box className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            {load.cargoDescription}
                         </p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg border border-white/5 space-y-2">
                         <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                            <span className="truncate">{load.originAddress}</span>
                         </p>
                         <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                            <span className="truncate">{load.destinationAddress}</span>
                         </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pt-4 border-t border-white/5 bg-background/20 backdrop-blur-sm">
                      {nextStatuses.map((nextStatus) => (
                        <Button
                          key={nextStatus}
                          className="w-full bg-primary hover:bg-primary/90 transition-transform active:scale-95"
                          onClick={() => handleUpdateStatus(trip.id, nextStatus)}
                          disabled={updating === trip.id}
                        >
                          {updating === trip.id ? (
                             <div className="flex items-center gap-2">
                               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full" />
                               Updating...
                             </div>
                          ) : ACTION_LABELS[nextStatus] || "Update Status"}
                        </Button>
                      ))}

                      {canSubmitPod && (
                        <Button
                          variant="outline"
                          className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors"
                          onClick={() => openPodModal(trip.id)}
                        >
                          <UploadCloud className="w-4 h-4 mr-2" /> Submit POD
                        </Button>
                      )}

                      {trip.proofOfDelivery && (
                        <div className="w-full flex items-center justify-center py-2 px-4 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> POD Verified
                        </div>
                      )}

                      {trip.status === "DELIVERED" && !canSubmitPod && !trip.proofOfDelivery && (
                         <Button variant="outline" className="w-full border-white/10" disabled>
                           Delivery Completed
                         </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* POD Submission Modal */}
      <Dialog open={podModalOpen} onOpenChange={setPodModalOpen}>
        <DialogContent className="glass-dark border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
               <UploadCloud className="text-primary" /> Submit Proof of Delivery
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPod} className="space-y-6 mt-4">
            <div className="space-y-3">
              <Label htmlFor="podImage" className="text-muted-foreground">Upload Image Evidence</Label>
              <div className="flex items-center justify-center w-full">
                 <label htmlFor="podImage" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-background/50 hover:bg-background/80 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                       <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                       <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                       <p className="text-xs text-muted-foreground/70">{podFile ? podFile.name : "SVG, PNG, JPG (MAX. 800x400px)"}</p>
                    </div>
                    <Input id="podImage" type="file" accept="image/*" className="hidden" onChange={(e) => setPodFile(e.target.files?.[0] || null)} required />
                 </label>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="podNotes" className="text-muted-foreground">Delivery Notes (Optional)</Label>
              <Textarea
                id="podNotes"
                className="bg-background/50 border-white/10 resize-none"
                placeholder="E.g., Left with security guard at gate 2"
                value={podNotes}
                onChange={(e) => setPodNotes(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 border-t border-white/10 pt-4 mt-2">
              <Button type="button" variant="ghost" onClick={() => setPodModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={!podFile || submittingPod}>
                {submittingPod ? "Submitting..." : "Submit Proof"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
