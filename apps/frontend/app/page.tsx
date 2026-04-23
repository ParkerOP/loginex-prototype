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
import {
  Package,
  Truck,
  Activity,
  Plus,
  LogOut,
  ArrowUpRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { getLoadsForShipper, getAvailableLoads, Load } from "../lib/api/loads";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/magic/BackgroundGradient";
import { usePerformance } from "@/components/providers/performance-context";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockChartData = [
  { name: "Mon", loads: 4 },
  { name: "Tue", loads: 3 },
  { name: "Wed", loads: 7 },
  { name: "Thu", loads: 5 },
  { name: "Fri", loads: 8 },
  { name: "Sat", loads: 2 },
  { name: "Sun", loads: 1 },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const { reduceMotion, isLowEnd } = usePerformance();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id && (session?.user as any)?.role) {
      if ((session.user as any).role === "SHIPPER") {
        getLoadsForShipper(session.user.id)
          .then((data) => {
            setLoads(data || []);
          })
          .catch((err) => console.error("Failed to fetch shipper loads", err))
          .finally(() => setLoading(false));
      } else if ((session.user as any).role === "DRIVER") {
        getAvailableLoads()
          .then((data) => {
            setLoads(data || []);
          })
          .catch((err) => console.error("Failed to fetch available loads", err))
          .finally(() => setLoading(false));
      }
    }
  }, [session]);

  if (status === "loading" || status === "unauthenticated") {
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

  const activeLoads = loads.filter((l) =>
    ["POSTED", "MATCHING", "BOOKED"].includes(l.status),
  ).length;
  const inTransitLoads = loads.filter((l) => l.status === "IN_TRANSIT").length;
  const completedLoads = loads.filter((l) => l.status === "DELIVERED").length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={reduceMotion ? {} : containerVariants}
      className="flex flex-col gap-8"
    >
      <motion.div
        variants={reduceMotion ? {} : itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Overview
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Welcome back,{" "}
            <span className="font-semibold text-foreground">
              {session?.user?.name || ((session?.user as any)?.role === "DRIVER" ? "Driver" : "Shipper")}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="glass" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
          {(session?.user as any)?.role === "SHIPPER" && (
            <Link href="/loads/new" passHref>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2 h-4 w-4" /> Post New Load
              </Button>
            </Link>
          )}
          {(session?.user as any)?.role === "DRIVER" && (
            <Link href="/find-loads" passHref>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Search className="mr-2 h-4 w-4" /> Find Loads
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {((session?.user as any)?.role === "DRIVER" ? [
          {
            title: "Available Loads",
            value: loads.length,
            icon: Search,
            desc: "Ready to pick up",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            title: "Active Trips",
            value: 0, // Mock for now
            icon: Truck,
            desc: "Currently driving",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            title: "Completed Trips",
            value: 0, // Mock for now
            icon: Activity,
            desc: "Total delivered",
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
        ] : [
          {
            title: "Active Loads",
            value: activeLoads,
            icon: Package,
            desc: "Awaiting drivers",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            title: "In Transit",
            value: inTransitLoads,
            icon: Truck,
            desc: "Drivers on the road",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            title: "Completed",
            value: completedLoads,
            icon: Activity,
            desc: "Total delivered",
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
        ]).map((stat, i) => (
          <motion.div
            key={i}
            variants={reduceMotion ? {} : itemVariants}
            className="h-full"
          >
            <BackgroundGradient
              className="rounded-xl h-full bg-card"
              animate={!reduceMotion && !isLowEnd}
            >
              <Card className="glass-card border-0 h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {loading ? "-" : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    {stat.desc}
                  </p>
                </CardContent>
              </Card>
            </BackgroundGradient>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <motion.div
          variants={reduceMotion ? {} : itemVariants}
          className="col-span-4 h-full"
        >
          <Card className="glass-card h-full flex flex-col">
            <CardHeader>
              <CardTitle>Load Volume Activity</CardTitle>
              <CardDescription>
                Your logistics throughput over the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              {!isLowEnd ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--muted-foreground)/0.2)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                      }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="loads"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{
                        fill: "hsl(var(--primary))",
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Chart disabled for performance.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={reduceMotion ? {} : itemVariants}
          className="col-span-3 h-full"
        >
          <Card className="glass-card h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Loads</CardTitle>
                <CardDescription>Your most recent activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                View All <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 w-full rounded-lg bg-muted/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : loads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No active loads</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Get started by posting your first load.
                  </p>
                  <Link href="/loads/new" passHref>
                    <Button size="sm">Post Load</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 pr-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {loads.slice(0, 5).map((load, i) => (
                      <motion.div
                        key={load.id}
                        initial={
                          reduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex items-center justify-between rounded-lg border border-border/50 bg-card/30 p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none flex items-center gap-2">
                            {load.originCity}{" "}
                            <ArrowUpRight className="h-3 w-3 text-muted-foreground" />{" "}
                            {load.destinationCity}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <span className="inline-block h-2 w-2 rounded-full bg-primary/50"></span>
                            {load.requiredVehicleType} •{" "}
                            {load.weight ? `${load.weight} kg` : "N/A"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={
                              load.status === "IN_TRANSIT"
                                ? "default"
                                : load.status === "DELIVERED"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-[10px] uppercase"
                          >
                            {load.status.replace("_", " ")}
                          </Badge>
                          <Link href={`/loads/${load.id}`} passHref>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              View
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
