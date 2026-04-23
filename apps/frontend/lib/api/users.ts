import { fetchApi } from "./client";

interface SessionLike {
  user?: {
    id?: string;
    role?: string;
  };
}

export interface UserProfileResponse {
  id: string;
  phone: string;
  role: string;
  shipperProfile?: {
    id: string;
    name: string;
    gstin?: string | null;
    planType: string;
  } | null;
  driverProfile?: {
    id: string;
    name: string;
    licenseNumber?: string | null;
    trustScore: number;
    planType: string;
  } | null;
}

export interface DriverUser {
  id: string;
  phone: string;
  role: string;
  driverProfile?: {
    id: string;
    name: string;
    licenseNumber?: string | null;
    trustScore: number;
    planType: string;
  } | null;
}

export async function getMyProfile(session?: SessionLike | null) {
  return fetchApi("/users/profile", { session }) as Promise<UserProfileResponse>;
}

export async function getDrivers(session?: SessionLike | null) {
  return fetchApi("/users/drivers", { session }) as Promise<DriverUser[]>;
}
