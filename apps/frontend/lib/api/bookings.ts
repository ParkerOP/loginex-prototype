import { fetchApi } from "./client";

interface SessionLike {
  user?: {
    id?: string;
    role?: string;
  };
}

export async function acceptLoad(
  loadId: string,
  driverId: string,
  session?: SessionLike | null,
) {
  return fetchApi("/bookings/accept", {
    method: "POST",
    session,
    body: JSON.stringify({ loadId, driverId }),
  });
}
