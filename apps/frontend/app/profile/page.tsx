"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { getMyProfile, UserProfileResponse } from "@/lib/api/users";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    getMyProfile(session)
      .then((data) => setProfile(data))
      .catch((error) => console.error("Failed to load profile", error));
  }, [session]);

  const role = (session?.user as { role?: string })?.role;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Profile
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Identity, trust and plan metadata.
        </p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Backed by shared API contracts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Name:</strong> {session?.user?.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {session?.user?.email || "N/A"}
            </p>
            <p>
              <strong>Role:</strong> {role || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {profile?.phone || "N/A"}
            </p>
            {role === "SHIPPER" && (
              <>
                <p>
                  <strong>Shipper ID:</strong> {profile?.shipperProfile?.id || "N/A"}
                </p>
                <p>
                  <strong>Plan:</strong> {profile?.shipperProfile?.planType || "FREE"}
                </p>
              </>
            )}
            {role === "DRIVER" && (
              <>
                <p>
                  <strong>Driver ID:</strong> {profile?.driverProfile?.id || "N/A"}
                </p>
                <p>
                  <strong>Trust Score:</strong>{" "}
                  {(profile?.driverProfile?.trustScore ?? 0).toFixed(2)}
                </p>
                <p>
                  <strong>Plan:</strong> {profile?.driverProfile?.planType || "FREE"}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
