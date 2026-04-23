"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Package, Clock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAvailableLoads, Load } from "@/lib/api/loads";
import { usePerformance } from "@/components/providers/performance-context";

export default function FindLoadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const { reduceMotion } = usePerformance();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if ((session?.user as any)?.role === "SHIPPER") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.id && (session?.user as any)?.role === "DRIVER") {
      getAvailableLoads()
        .then((data) => {
          setLoads(data || []);
        })
        .catch((err) => console.error("Failed to fetch available loads", err))
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || status === "unauthenticated" || (session?.user as any)?.role !== "DRIVER") {
    return (
      <div className="flex h-screen items-center justify-center">
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
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Find Loads
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Browse and accept available loads in your area.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 w-full rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : loads.length === 0 ? (
        <Card className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl mb-2">No loads available</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            There are currently no posted loads matching your criteria. Check back later or adjust your preferences.
          </CardDescription>
        </Card>
      ) : (
        <motion.div
          variants={reduceMotion ? {} : containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {loads.map((load) => (
              <motion.div key={load.id} variants={reduceMotion ? {} : itemVariants} layout>
                <Card className="glass-card h-full flex flex-col transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/10">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        {load.requiredVehicleType}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(load.scheduledTime).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex flex-col space-y-4 flex-1">
                      <div className="relative flex flex-col space-y-3 pl-6 border-l-2 border-muted ml-2">
                        <div className="absolute w-3 h-3 bg-background border-2 border-primary rounded-full -left-[7px] top-0" />
                        <div className="absolute w-3 h-3 bg-background border-2 border-accent rounded-full -left-[7px] bottom-1" />

                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pickup</p>
                          <p className="font-semibold text-foreground">{load.originCity}</p>
                          <p className="text-xs text-muted-foreground truncate">{load.originAddress}</p>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dropoff</p>
                          <p className="font-semibold text-foreground">{load.destinationCity}</p>
                          <p className="text-xs text-muted-foreground truncate">{load.destinationAddress}</p>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-md p-3 mt-auto">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Package className="h-3 w-3" /> Cargo
                          </span>
                          <span className="font-medium truncate max-w-[120px]">{load.cargoDescription}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Weight
                          </span>
                          <span className="font-medium">{load.weight ? `${load.weight} kg` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4 group">
                      Accept Load <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
