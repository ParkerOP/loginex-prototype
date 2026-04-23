"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLoadsForShipper, Load } from "@/lib/api/loads";

export default function MyLoadsPage() {
  const { data: session } = useSession();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const isShipper = (session?.user as { role?: string })?.role === "SHIPPER";

  useEffect(() => {
    if (!session?.user?.id || !isShipper) {
      setLoading(false);
      return;
    }
    getLoadsForShipper(session.user.id, session)
      .then((data) => setLoads(data || []))
      .catch((error) => console.error("Failed to fetch shipper loads", error))
      .finally(() => setLoading(false));
  }, [session, isShipper]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            My Loads
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Posted, in-transit and completed load lifecycle.
          </p>
        </div>
        {isShipper && (
          <Link href="/loads/new">
            <Button>Post New Load</Button>
          </Link>
        )}
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Load History</CardTitle>
          <CardDescription>Source of truth for shipper operations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading loads...</p>}
          {!loading && !isShipper && (
            <p className="text-sm text-muted-foreground">
              Load posting history is available for shipper accounts.
            </p>
          )}
          {!loading && isShipper && loads.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No loads posted yet.
            </p>
          )}
          {!loading &&
            loads.map((load) => (
              <div
                key={load.id}
                className="rounded-lg border border-border/60 p-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium">
                    {load.originCity} to {load.destinationCity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {load.requiredVehicleType} | {load.cargoDescription}
                  </p>
                </div>
                <Badge variant="outline">{load.status}</Badge>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
