import { fetchApi } from "./client";

interface SessionLike {
  user?: {
    id?: string;
    role?: string;
  };
}

export interface Trip {
  id: string;
  status: string;
  driverId: string;
  booking?: {
    load?: {
      id: string;
      originCity: string;
      destinationCity: string;
      cargoDescription: string;
      requiredVehicleType: string;
      weight?: number | null;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export async function getTripsByDriver(
  driverId: string,
  session?: SessionLike | null,
) {
  return fetchApi(`/trips/driver/${driverId}`, { session }) as Promise<Trip[]>;
}

export async function updateTripStatus(
  tripId: string,
  driverId: string,
  status: "IN_TRANSIT" | "ARRIVED" | "DELIVERED",
  session?: SessionLike | null,
) {
  return fetchApi(`/trips/${tripId}/status`, {
    method: "PUT",
    session,
    body: JSON.stringify({ driverId, status }),
  });
}
