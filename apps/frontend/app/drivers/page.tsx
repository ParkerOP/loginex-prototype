"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDrivers, DriverUser } from "@/lib/api/users";

export default function DriversPage() {
  const { data: session } = useSession();
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const isShipper = (session?.user as { role?: string })?.role === "SHIPPER";

  useEffect(() => {
    getDrivers(session)
      .then((data) => setDrivers(data || []))
      .catch((error) => console.error("Failed to fetch drivers", error))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Drivers
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Fleet visibility with trust and plan metadata.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Driver Network</CardTitle>
          <CardDescription>Available drivers across the prototype marketplace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading drivers...</p>}
          {!loading && !isShipper && (
            <p className="text-sm text-muted-foreground">
              Driver discovery is primarily for shipper accounts.
            </p>
          )}
          {!loading && drivers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No drivers found. Run admin simulation to seed sample drivers.
            </p>
          )}
          {!loading &&
            drivers.map((driver) => (
              <div
                key={driver.id}
                className="rounded-lg border border-border/60 p-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{driver.driverProfile?.name || "Unnamed Driver"}</p>
                  <p className="text-xs text-muted-foreground">
                    Phone: {driver.phone} | Trust: {(driver.driverProfile?.trustScore ?? 0).toFixed(1)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline">{driver.driverProfile?.planType || "FREE"}</Badge>
                  <p className="text-xs text-muted-foreground">
                    License: {driver.driverProfile?.licenseNumber || "N/A"}
                  </p>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
