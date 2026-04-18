"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Activity, Plus, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { getLoadsForShipper, Load } from "../lib/api/loads";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      getLoadsForShipper(session.user.id)
        .then((data) => {
          setLoads(data || []);
        })
        .catch((err) => console.error("Failed to fetch loads", err))
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const activeLoads = loads.filter(l => ["POSTED", "MATCHING", "BOOKED"].includes(l.status)).length;
  const inTransitLoads = loads.filter(l => l.status === "IN_TRANSIT").length;
  const completedLoads = loads.filter(l => l.status === "DELIVERED").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "Shipper"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
          <Link href="/loads/new" passHref><Button>
              <Plus className="mr-2 h-4 w-4" /> Post New Load
            </Button></Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : activeLoads}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting drivers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : inTransitLoads}</div>
            <p className="text-xs text-muted-foreground">
              Drivers on the road
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : completedLoads}</div>
            <p className="text-xs text-muted-foreground">
              Total delivered
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Loads</CardTitle>
            <CardDescription>
              Your most recently posted and active loads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading recent trips...</p>
            ) : loads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No loads found. Post your first load!</p>
            ) : (
              <div className="space-y-4">
                {loads.slice(0, 5).map((load) => (
                  <div key={load.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {load.originCity} to {load.destinationCity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {load.requiredVehicleType} • {load.weight ? `${load.weight} kg` : 'N/A weight'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={load.status === "IN_TRANSIT" ? "default" : "secondary"}>
                        {load.status.replace('_', ' ')}
                      </Badge>
                      <Link href={`/loads/${load.id}`} passHref>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Action Needed</CardTitle>
            <CardDescription>
              Tasks requiring your attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="rounded-lg border p-3 bg-muted/50">
                  <p className="text-sm font-medium">Approve POD for Trip #892</p>
                  <p className="text-xs text-muted-foreground mt-1">Driver: Raj Kumar</p>
                  <Button size="sm" className="mt-3 w-full">Review Document</Button>
               </div>
               <div className="rounded-lg border p-3 bg-muted/50">
                  <p className="text-sm font-medium">Pending Invoice Payment</p>
                  <p className="text-xs text-muted-foreground mt-1">Amount: ₹1,450.00</p>
                  <Button size="sm" variant="outline" className="mt-3 w-full">Pay via Razorpay</Button>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
