"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Manage your account preferences.
        </p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Adjust application settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notification and display settings coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
