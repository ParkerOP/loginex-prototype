import { fetchApi } from "./client";

interface SessionLike {
  user?: {
    id?: string;
    role?: string;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalShippers: number;
  totalDrivers: number;
  totalLoads: number;
  activeLoads: number;
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
}

export interface AdminLoadRow {
  id: string;
  originCity: string;
  destinationCity: string;
  status: string;
  createdAt: string;
  shipper?: {
    name?: string;
  };
}

export interface InvestorMetrics {
  funnel: {
    posted: number;
    matched: number;
    booked: number;
    started: number;
    delivered: number;
    deliveredConversionPct: number;
  };
  revenue: {
    invoiceCount: number;
    invoiceTotal: number;
    platformFeePending: number;
    platformFeeCollected: number;
  };
  trustAndRisk: {
    avgDriverTrustScore: number;
    openDisputes: number;
    resolvedDisputes: number;
    podCount: number;
    podCoveragePct: number;
  };
  breakdown: {
    loadStatus: Record<string, number>;
    tripStatus: Record<string, number>;
  };
}

export async function getAdminStats(session?: SessionLike | null) {
  return fetchApi("/admin/stats", { session }) as Promise<AdminStats>;
}

export async function getAdminLoads(session?: SessionLike | null) {
  return fetchApi("/admin/loads", { session }) as Promise<AdminLoadRow[]>;
}

export async function getAdminInvestorMetrics(session?: SessionLike | null) {
  return fetchApi("/admin/investor-metrics", { session }) as Promise<InvestorMetrics>;
}

export async function runAdminSimulation(session?: SessionLike | null) {
  return fetchApi("/admin/simulate", {
    method: "POST",
    session,
  }) as Promise<{
    success: boolean;
    data: {
      loadId: string;
      tripId: string;
      disputeId: string | null;
      fraudMode: boolean;
    };
  }>;
}

export async function runAdminBatchSimulation(
  count: number,
  session?: SessionLike | null,
) {
  return fetchApi(`/admin/simulate-batch/${count}`, {
    method: "POST",
    session,
  }) as Promise<{
    success: boolean;
    message: string;
    data: Array<{
      loadId: string;
      tripId: string;
      disputeId: string | null;
      fraudMode: boolean;
    }>;
  }>;
}
