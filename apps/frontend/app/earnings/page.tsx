"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { usePerformance } from "@/components/providers/performance-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IndianRupee, Wallet, TrendingUp, History } from "lucide-react";

export default function EarningsPage() {
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
        <h1 className="text-4xl font-extrabold tracking-tight">Earnings & Wallet</h1>
        <p className="text-muted-foreground mt-1 text-lg">Track your payouts and platform fees.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div variants={reduceMotion ? {} : itemVariants}>
          <Card className="glass-card h-full bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" /> Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold flex items-center"><IndianRupee className="w-6 h-6 mr-1" />0.00</div>
              <p className="text-xs text-muted-foreground mt-2">+₹0.00 this week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={reduceMotion ? {} : itemVariants}>
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" /> Pending Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold flex items-center"><IndianRupee className="w-6 h-6 mr-1" />0.00</div>
              <p className="text-xs text-muted-foreground mt-2">Will be settled on next business day</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={reduceMotion ? {} : itemVariants}>
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-red-500" /> Platform Fees Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold flex items-center"><IndianRupee className="w-6 h-6 mr-1" />0.00</div>
              <p className="text-xs text-muted-foreground mt-2">On FREE plan (₹50/trip)</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={reduceMotion ? {} : itemVariants} className="mt-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent payouts and fee deductions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-lg border border-dashed border-border/50">
               <History className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
               <p className="font-medium">No transactions yet</p>
               <p className="text-xs text-muted-foreground mt-1">Complete your first delivery to see earnings here.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
