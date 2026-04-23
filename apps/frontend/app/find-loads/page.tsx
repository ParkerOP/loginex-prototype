"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
export default function FindLoadsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Find Loads
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Discover new trips near you.
        </p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Available Loads</CardTitle>
          <CardDescription>Search and filter open loads.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Load board coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
