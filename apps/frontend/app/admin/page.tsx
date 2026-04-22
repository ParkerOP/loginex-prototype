"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/magic/BackgroundGradient";
import {
  Activity,
  Users,
  Truck,
  Package,
  Play,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loads, setLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch("http://localhost:3000/admin/stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      const loadsRes = await fetch("http://localhost:3000/admin/loads");
      const loadsData = await loadsRes.json();
      setLoads(loadsData);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
      toast.error("Failed to connect to backend APIs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000); // Live refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    toast("Starting simulation...", {
      description: "Generating mock users and load lifecycle",
    });
    try {
      const res = await fetch("http://localhost:3000/admin/simulate", {
        method: "POST",
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Simulation Complete", {
          description: `Load ${result.data.loadId.substring(0, 8)} processed successfully. Fraud flags triggered in backend logs.`,
        });
        await fetchDashboardData();
      } else {
        toast.error("Simulation failed");
      }
    } catch (error) {
      toast.error("Error during simulation");
    } finally {
      setSimulating(false);
    }
  };

  const chartData = [
    { name: "00:00", trips: Math.floor(Math.random() * 10) },
    { name: "04:00", trips: Math.floor(Math.random() * 20) },
    { name: "08:00", trips: Math.floor(Math.random() * 50) },
    { name: "12:00", trips: Math.floor(Math.random() * 80) },
    { name: "16:00", trips: Math.floor(Math.random() * 60) },
    { name: "20:00", trips: Math.floor(Math.random() * 30) },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-blue-600" />
              LogineX Admin Center
            </h1>
            <p className="text-gray-500 mt-2">
              Investor Prototype Control Panel & Observability
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleSimulate}
            disabled={simulating}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
          >
            {simulating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : (
              <Play className="h-5 w-5 mr-2" />
            )}
            {simulating ? "Simulating Lifecycle..." : "Run E2E Simulation"}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BackgroundGradient className="rounded-[22px] bg-white p-1">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats?.totalUsers || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Shippers: {stats?.totalShippers} | Drivers:{" "}
                  {stats?.totalDrivers}
                </p>
              </CardContent>
            </Card>
          </BackgroundGradient>

          <BackgroundGradient className="rounded-[22px] bg-white p-1">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Loads
                </CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats?.totalLoads || 0}
                </div>
                <p className="text-xs text-blue-500 mt-1">
                  {stats?.activeLoads || 0} currently active
                </p>
              </CardContent>
            </Card>
          </BackgroundGradient>

          <BackgroundGradient className="rounded-[22px] bg-white p-1">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Active Trips
                </CardTitle>
                <Truck className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats?.activeTrips || 0}
                </div>
                <p className="text-xs text-orange-500 mt-1">In transit</p>
              </CardContent>
            </Card>
          </BackgroundGradient>

          <BackgroundGradient className="rounded-[22px] bg-white p-1">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Completed
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats?.completedTrips || 0}
                </div>
                <p className="text-xs text-green-500 mt-1">
                  Successful deliveries
                </p>
              </CardContent>
            </Card>
          </BackgroundGradient>
        </div>

        {/* Chart and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>System Activity (Simulated Volume)</CardTitle>
              <CardDescription>
                Mock real-time trip completion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="trips"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Live System Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto bg-gray-900 text-green-400 font-mono text-xs">
              <div className="p-4 space-y-2">
                <div className="text-gray-500">
                  // Real-time observability stream
                </div>
                {loads.slice(0, 5).map((load, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={load.id}
                  >
                    [{new Date(load.createdAt).toLocaleTimeString()}] LOAD_
                    {load.id.substring(0, 6)}: Status changed to {load.status}
                  </motion.div>
                ))}
                {simulating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-yellow-400"
                  >
                    &gt; Running automated lifecycle simulation...
                  </motion.div>
                )}
                {simulating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-red-400"
                  >
                    [WARN] FRAUD ALERT: Unrealistic speed detected for simulated
                    trip.
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Master Data Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Loads & Trips</CardTitle>
            <CardDescription>Live view of all system loads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Route</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Shipper</th>
                    <th className="px-6 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {loads.map((load: any) => (
                      <motion.tr
                        key={load.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-mono text-xs">
                          {load.id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {load.originCity} → {load.destinationCity}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              load.status === "DELIVERED"
                                ? "default"
                                : load.status === "IN_TRANSIT"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              load.status === "DELIVERED"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : load.status === "IN_TRANSIT"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : ""
                            }
                          >
                            {load.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {load.shipper?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(load.createdAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {loads.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No loads available. Click 'Run E2E Simulation' to
                        generate data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
