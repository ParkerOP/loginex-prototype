"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { usePerformance } from "@/components/providers/performance-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  const { data: session, status } = useSession();
  const { reduceMotion } = usePerformance();

  if (status === "loading" || !session) {
    return (
      <div className="flex h-64 items-center justify-center">
         <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
         />
      </div>
    );
  }

  const role = (session.user as { role?: string })?.role || "SHIPPER";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={reduceMotion ? {} : containerVariants}
      className="flex flex-col gap-8"
    >
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground mt-1 text-lg">Manage your invoices, payments, and platform subscription.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {role === "SHIPPER" ? (
          <>
            <motion.div variants={reduceMotion ? {} : itemVariants}>
              <Card className="glass-card h-full border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary" /> Current Plan</CardTitle>
                  <CardDescription>Your active subscription tier.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">FREE</div>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Standard invoice rates</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Basic load matching</li>
                  </ul>
                  <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">Upgrade to SME</Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={reduceMotion ? {} : itemVariants} className="lg:col-span-2">
              <Card className="glass-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText /> Recent Invoices</CardTitle>
                  <CardDescription>View and download your recent trip invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg border border-dashed border-border/50">
                     <FileText className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
                     <p className="font-medium">No recent invoices</p>
                     <p className="text-xs text-muted-foreground mt-1">Complete a trip to generate an invoice.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div variants={reduceMotion ? {} : itemVariants}>
              <Card className="glass-card h-full border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary" /> Driver Plan</CardTitle>
                  <CardDescription>Your active subscription tier.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">FREE</div>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> ₹50 Platform fee per trip</li>
                    <li className="flex items-center gap-2 opacity-50"><CheckCircle2 className="w-4 h-4" /> Priority load matching (PRO)</li>
                  </ul>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">Upgrade to PRO (₹10/trip)</Button>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
