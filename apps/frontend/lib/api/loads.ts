import { fetchApi } from "./client";
interface SessionLike {
  user?: {
    id?: string;
    role?: string;
  };
}

export interface Load {
  id: string;
  shipperId: string;
  originAddress: string;
  originCity: string;
  destinationAddress: string;
  destinationCity: string;
  cargoDescription: string;
  requiredVehicleType: string;
  weight?: number;
  scheduledTime: string;
  specialInstructions?: string;
  status: string;
  createdAt: string;
}

export async function createLoad(data: Partial<Load>, session?: SessionLike | null) {
  return fetchApi("/loads", {
    method: "POST",
    body: JSON.stringify(data),
    session,
  });
}

export async function getLoadsForShipper(
  shipperId: string,
  session?: SessionLike | null,
): Promise<Load[]> {
  return fetchApi(`/loads/shipper/${shipperId}`, { session });
}


export async function getAvailableLoads(session?: SessionLike | null): Promise<Load[]> {
  return fetchApi('/loads/available', { session });
}
