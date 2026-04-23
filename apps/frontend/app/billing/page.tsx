"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInvoicesForShipper, Invoice } from "@/lib/api/billing";

export default function BillingPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const isShipper = (session?.user as { role?: string })?.role === "SHIPPER";

  useEffect(() => {
    if (!session?.user?.id || !isShipper) {
      setLoading(false);
      return;
    }

    getInvoicesForShipper(session.user.id, session)
      .then((data) => setInvoices(data || []))
      .catch((error) => console.error("Failed to fetch invoices", error))
      .finally(() => setLoading(false));
  }, [session, isShipper]);

  const totalBilled = useMemo(
    () => invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
    [invoices],
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Billing
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Invoices and monetization visibility for completed trips.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{invoices.length}</CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Billed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            INR {totalBilled.toFixed(2)}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Plan</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {(session?.user as { role?: string })?.role === "SHIPPER" ? "SME / Free" : "N/A"}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Generated on completed delivery lifecycle.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading invoices...</p>}
          {!loading && !isShipper && (
            <p className="text-sm text-muted-foreground">
              Billing is available for shipper accounts.
            </p>
          )}
          {!loading && isShipper && invoices.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No invoices yet. Run admin simulation or complete a trip to generate one.
            </p>
          )}
          {!loading &&
            invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-lg border border-border/60 p-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium">Trip {invoice.tripId.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(invoice.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">INR {invoice.amount.toFixed(2)}</p>
                  <Badge variant="outline">{invoice.status}</Badge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
