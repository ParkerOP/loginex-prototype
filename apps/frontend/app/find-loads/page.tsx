"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchApi } from "@/lib/api/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Truck, Calendar, MapPinned, Search, Flame } from "lucide-react";
import { usePerformance } from "@/components/providers/performance-context";

// Define a basic interface for the Load and Match response
interface Load {
  id: string;
  originCity: string;
  originAddress: string;
  destinationCity: string;
  destinationAddress: string;
  requiredVehicleType: string;
  cargoDescription: string;
  scheduledTime: string;
}

interface MatchResult {
  load: Load;
  score: number;
}

export default function FindLoadsPage() {
  const { data: session, status } = useSession();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState<string | null>(null);

  const [cityFilter, setCityFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string | null>("ALL");
  const { reduceMotion } = usePerformance();

  useEffect(() => {
    if (session?.user) {
      fetchMatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, cityFilter, vehicleTypeFilter]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (cityFilter) queryParams.append("city", cityFilter);
      if (vehicleTypeFilter && vehicleTypeFilter !== "ALL") queryParams.append("vehicleType", vehicleTypeFilter);

      const response = await fetchApi(`/matches/available?${queryParams.toString()}`, { session });
      setMatches(response.matches || []);
    } catch (error) {
      console.error("Failed to fetch matches", error);
      toast.error("Failed to load available matches");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestMatch = async (loadId: string) => {
    setSuggesting(loadId);
    try {
      await fetchApi(`/matches/suggest`, {
        method: "POST",
        session,
        body: JSON.stringify({ loadId }),
      });
      toast.success("Match suggestion sent successfully!");
      // Remove the load from the list after successful suggestion
      setMatches(prevMatches => prevMatches.filter(m => m.load.id !== loadId));
    } catch (error: unknown) {
      console.error("Failed to suggest match", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to suggest match";
      toast.error(errorMessage);
    } finally {
      setSuggesting(null);
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
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
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
          <h1 className="text-3xl font-extrabold tracking-tight">Find Loads</h1>
          <p className="text-muted-foreground mt-1">Discover available trips matching your vehicle profile.</p>
        </div>
      </div>

      <motion.div variants={reduceMotion ? {} : itemVariants} className="glass-card p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center z-20">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="pl-9 bg-background/50 border-white/10 w-full"
          />
        </div>
        <Select value={vehicleTypeFilter ?? undefined} onValueChange={(val: string | null) => setVehicleTypeFilter(val)}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-white/10">
            <SelectValue placeholder="Vehicle Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Vehicle Types</SelectItem>
            <SelectItem value="TATA_ACE">Tata Ace</SelectItem>
            <SelectItem value="14_FT">14 FT Truck</SelectItem>
            <SelectItem value="19_FT">19 FT Truck</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3, 4, 5, 6].map(i => (
             <Card key={i} className="glass-card animate-pulse h-64 border-white/5" />
           ))}
        </div>
      ) : matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl border-dashed border-2 border-white/10"
        >
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
             <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No loads available</h3>
          <p className="text-muted-foreground mt-2 max-w-md">We could not find any loads matching your current filters and profile. Check back later or adjust your filters.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {matches.map(({ load, score }) => (
              <motion.div
                key={load.id}
                variants={reduceMotion ? {} : itemVariants}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                layout
                className="group h-full"
              >
                <Card className="glass-card h-full flex flex-col border-white/5 hover:border-primary/50 transition-colors duration-300">
                  <CardHeader className="pb-3 border-b border-white/5">
                    <div className="flex justify-between items-start mb-2">
                       <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          <Truck className="w-3 h-3 mr-1" /> {load.requiredVehicleType}
                       </Badge>
                       <div className="flex items-center text-xs font-semibold px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                          <Flame className="w-3 h-3 mr-1" /> {score}% Match
                       </div>
                    </div>
                    <CardTitle className="flex flex-col gap-2 text-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{load.originCity}</span>
                      </div>
                      <div className="pl-2 border-l-2 border-muted-foreground/30 ml-1.5 h-3" />
                      <div className="flex items-center gap-2">
                        <MapPinned className="w-4 h-4 text-primary" />
                        <span className="truncate">{load.destinationCity}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-4 pt-4 flex-1">
                    <div>
                       <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Cargo</p>
                       <p className="font-medium">{load.cargoDescription}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Pickup Time</p>
                          <p className="font-medium flex items-center gap-1.5">
                             <Calendar className="w-3 h-3 text-muted-foreground" />
                             {new Date(load.scheduledTime).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-white/5">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 transition-transform active:scale-95"
                      onClick={() => handleSuggestMatch(load.id)}
                      disabled={suggesting === load.id}
                    >
                      {suggesting === load.id ? (
                        <div className="flex items-center gap-2">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full" />
                          Processing...
                        </div>
                      ) : "Accept Load"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
