"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Profile
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Manage your personal information.
        </p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Your registered prototype account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Name:</strong> {session?.user?.name || "Loading..."}
            </p>
            <p>
              <strong>Email:</strong> {session?.user?.email || "Loading..."}
            </p>
            <p>
              <strong>Role:</strong>{" "}
              {(session?.user as {role?: string})?.role || "Loading..."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
