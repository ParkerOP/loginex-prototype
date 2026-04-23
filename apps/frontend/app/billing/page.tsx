"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Billing
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Manage your payments and invoices.
        </p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>No recent invoices found.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your billing history will appear here once trips are completed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
