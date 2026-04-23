import { fetchApi } from "./client";

interface SessionLike {
  user?: {
    id?: string;
    role?: string;
  };
}

export interface Invoice {
  id: string;
  tripId: string;
  amount: number;
  status: string;
  fileUrl?: string | null;
  createdAt: string;
}

export interface DriverEarning {
  tripId: string;
  amount: number;
  date: string;
}

export interface DriverEarningsResponse {
  total: number;
  history: DriverEarning[];
}

export async function getInvoicesForShipper(
  shipperId: string,
  session?: SessionLike | null,
) {
  return fetchApi(`/billing/invoices/${shipperId}`, { session }) as Promise<Invoice[]>;
}

export async function getEarningsForDriver(
  driverId: string,
  session?: SessionLike | null,
) {
  return fetchApi(`/billing/earnings/${driverId}`, {
    session,
  }) as Promise<DriverEarningsResponse>;
}
