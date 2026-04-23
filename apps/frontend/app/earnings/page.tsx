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
import { getEarningsForDriver, DriverEarningsResponse } from "@/lib/api/billing";

const emptyEarnings: DriverEarningsResponse = { total: 0, history: [] };

export default function EarningsPage() {
  const { data: session } = useSession();
  const [earnings, setEarnings] = useState<DriverEarningsResponse>(emptyEarnings);
  const [loading, setLoading] = useState(true);
  const isDriver = (session?.user as { role?: string })?.role === "DRIVER";

  useEffect(() => {
    if (!session?.user?.id || !isDriver) {
      setLoading(false);
      return;
    }

    getEarningsForDriver(session.user.id, session)
      .then((data) => setEarnings(data || emptyEarnings))
      .catch((error) => console.error("Failed to fetch driver earnings", error))
      .finally(() => setLoading(false));
  }, [session, isDriver]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Earnings
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Payout-ready view of completed delivery trips.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            INR {earnings.total.toFixed(2)}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Delivered Trips</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {earnings.history.length}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>Generated from delivered trips.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading earnings...</p>}
          {!loading && !isDriver && (
            <p className="text-sm text-muted-foreground">
              Earnings are available for driver accounts.
            </p>
          )}
          {!loading && isDriver && earnings.history.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No earnings yet. Accept and complete trips to generate payout events.
            </p>
          )}
          {!loading &&
            earnings.history.map((entry) => (
              <div
                key={`${entry.tripId}-${entry.date}`}
                className="rounded-lg border border-border/60 p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">Trip {entry.tripId.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleString()}
                  </p>
                </div>
                <p className="font-semibold">INR {entry.amount.toFixed(2)}</p>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
