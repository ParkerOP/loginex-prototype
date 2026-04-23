"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
export default function MyLoadsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          My Loads
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          View and manage all your posted loads.
        </p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Loads</CardTitle>
          <CardDescription>History of your logistics.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Load list rendering goes here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
