"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/magic/BackgroundGradient";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Coins,
  Gauge,
  Play,
  ShieldAlert,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  AdminLoadRow,
  AdminStats,
  InvestorMetrics,
  getAdminInvestorMetrics,
  getAdminLoads,
  getAdminStats,
  runAdminBatchSimulation,
  runAdminSimulation,
} from "@/lib/api/admin";
import { useSession } from "next-auth/react";

const defaultStats: AdminStats = {
  totalUsers: 0,
  totalShippers: 0,
  totalDrivers: 0,
  totalLoads: 0,
  activeLoads: 0,
  totalTrips: 0,
  activeTrips: 0,
  completedTrips: 0,
};

const defaultInvestorMetrics: InvestorMetrics = {
  funnel: {
    posted: 0,
    matched: 0,
    booked: 0,
    started: 0,
    delivered: 0,
    deliveredConversionPct: 0,
  },
  revenue: {
    invoiceCount: 0,
    invoiceTotal: 0,
    platformFeePending: 0,
    platformFeeCollected: 0,
  },
  trustAndRisk: {
    avgDriverTrustScore: 0,
    openDisputes: 0,
    resolvedDisputes: 0,
    podCount: 0,
    podCoveragePct: 0,
  },
  breakdown: {
    loadStatus: {},
    tripStatus: {},
  },
};

const statusPalette = ["#2563eb", "#16a34a", "#ea580c", "#9333ea", "#dc2626", "#0ea5e9"];

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats>(defaultStats);
  const [investorMetrics, setInvestorMetrics] =
    useState<InvestorMetrics>(defaultInvestorMetrics);
  const [loads, setLoads] = useState<AdminLoadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsData, loadsData, metricsData] = await Promise.all([
        getAdminStats(session),
        getAdminLoads(session),
        getAdminInvestorMetrics(session),
      ]);
      setStats(statsData || defaultStats);
      setLoads(loadsData || []);
      setInvestorMetrics(metricsData || defaultInvestorMetrics);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
      toast.error("Failed to connect to backend APIs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const runSingleSimulation = async () => {
    setSimulating(true);
    toast("Running lifecycle simulation...");
    try {
      const result = await runAdminSimulation(session);
      if (result?.success) {
        toast.success("Simulation complete", {
          description: `Load ${result.data.loadId.slice(0, 8)} | Trip ${result.data.tripId.slice(0, 8)}`,
        });
      }
      await fetchDashboardData();
    } catch {
      toast.error("Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  const runBatchSimulation = async (count: number) => {
    setSimulating(true);
    toast(`Seeding ${count} lifecycle runs...`);
    try {
      const result = await runAdminBatchSimulation(count, session);
      if (result?.success) {
        const fraudCount = result.data.filter((item) => item.fraudMode).length;
        const disputeCount = result.data.filter((item) => item.disputeId).length;
        toast.success("Batch simulation complete", {
          description: `${result.data.length} runs | fraud cases: ${fraudCount} | disputes: ${disputeCount}`,
        });
      }
      await fetchDashboardData();
    } catch {
      toast.error("Batch simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  const activityChartData = useMemo(
    () => [
      { name: "Users", value: stats.totalUsers },
      { name: "Loads", value: stats.totalLoads },
      { name: "Trips", value: stats.totalTrips },
      { name: "Active", value: stats.activeTrips },
      { name: "Done", value: stats.completedTrips },
    ],
    [stats],
  );

  const funnelChartData = useMemo(
    () => [
      { stage: "Posted", value: investorMetrics.funnel.posted },
      { stage: "Matched", value: investorMetrics.funnel.matched },
      { stage: "Booked", value: investorMetrics.funnel.booked },
      { stage: "Started", value: investorMetrics.funnel.started },
      { stage: "Delivered", value: investorMetrics.funnel.delivered },
    ],
    [investorMetrics],
  );

  const tripStatusPieData = useMemo(
    () =>
      Object.entries(investorMetrics.breakdown.tripStatus).map(([name, value]) => ({
        name,
        value,
      })),
    [investorMetrics],
  );

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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-blue-600" />
              LogineX Control Room
            </h1>
            <p className="text-gray-500 mt-2">
              Real-time marketplace simulation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={runSingleSimulation}
              disabled={simulating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Run 1x
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => runBatchSimulation(5)}
              disabled={simulating}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Seed 5x
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => runBatchSimulation(15)}
              disabled={simulating}
            >
              <Gauge className="h-4 w-4 mr-2" />
              Seed 15x
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <BackgroundGradient className="rounded-[22px] bg-white p-1">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Users</CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Shippers {stats.totalShippers} | Drivers {stats.totalDrivers}
                </p>
              </CardContent>
            </Card>
          </BackgroundGradient>

          <BackgroundGradient className="rounded-[22px] bg-white p-1">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Trip Conversion</CardTitle>
                <Truck className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {investorMetrics.funnel.deliveredConversionPct}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Delivered {investorMetrics.funnel.delivered} / Posted {investorMetrics.funnel.posted}
                </p>
              </CardContent>
            </Card>
          </BackgroundGradient>

          <BackgroundGradient className="rounded-[22px] bg-white p-1">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Invoice Revenue</CardTitle>
                <Coins className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  INR {investorMetrics.revenue.invoiceTotal.toFixed(0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {investorMetrics.revenue.invoiceCount} invoices issued
                </p>
              </CardContent>
            </Card>
          </BackgroundGradient>

          <BackgroundGradient className="rounded-[22px] bg-white p-1">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Risk Panel</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{investorMetrics.trustAndRisk.openDisputes}</div>
                <p className="text-xs text-gray-500 mt-1">
                  POD coverage {investorMetrics.trustAndRisk.podCoveragePct}%
                </p>
              </CardContent>
            </Card>
          </BackgroundGradient>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Core Activity Pulse</CardTitle>
              <CardDescription>System volume and throughput signals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
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

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Trip Status Mix</CardTitle>
              <CardDescription>Live lifecycle distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tripStatusPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={92}
                    >
                      {tripStatusPieData.map((entry, index) => (
                        <Cell key={entry.name} fill={statusPalette[index % statusPalette.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Funnel Health</CardTitle>
              <CardDescription>Posted to delivered conversion funnel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="stage" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Live Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto bg-gray-900 text-green-400 font-mono text-xs">
              <div className="p-4 space-y-2">
                {loads.slice(0, 10).map((load) => (
                  <div key={load.id}>
                    [{new Date(load.createdAt).toLocaleTimeString()}] LOAD_{load.id.slice(0, 6)}{" "}
                    {load.originCity} to {load.destinationCity} status={load.status}
                  </div>
                ))}
                {loads.length === 0 && (
                  <div className="text-gray-400">
                    No load events yet. Use simulation buttons to generate investor demo data.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Loads & Trips</CardTitle>
            <CardDescription>Live operational table with lifecycle status</CardDescription>
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
                  {loads.map((load) => (
                    <tr key={load.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs">{load.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-medium">
                        {load.originCity} to {load.destinationCity}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{load.status}</Badge>
                      </td>
                      <td className="px-6 py-4">{load.shipper?.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(load.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {loads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No loads available. Use simulation to seed activity.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Avg Driver Trust</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {investorMetrics.trustAndRisk.avgDriverTrustScore.toFixed(2)}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Platform Fee Pending</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              INR {investorMetrics.revenue.platformFeePending.toFixed(2)}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resolved Disputes</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {investorMetrics.trustAndRisk.resolvedDisputes}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
