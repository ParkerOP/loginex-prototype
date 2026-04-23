import { fetchApi } from "./client";

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

export async function createLoad(data: Partial<Load>) {
  return fetchApi("/loads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getLoadsForShipper(shipperId: string): Promise<Load[]> {
  return fetchApi(`/loads/shipper/${shipperId}`);
}
