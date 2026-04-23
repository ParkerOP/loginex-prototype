"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
export default function DriversPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Drivers
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          View available and assigned drivers.
        </p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Driver Fleet</CardTitle>
          <CardDescription>Manage your trusted drivers.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Driver network matching features coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
