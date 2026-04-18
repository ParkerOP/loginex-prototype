"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
            <Truck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">LogineX</h1>
          <p className="text-sm text-muted-foreground mt-2">
            The intra-city logistics platform for SMEs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{step === 1 ? "Welcome back" : "Enter Verification Code"}</CardTitle>
            <CardDescription>
              {step === 1
                ? "Enter your phone number to sign in to your account."
                : "We've sent a 4-digit code to your phone."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form id="login-form" onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+91 98765 43210" required type="tel" />
                </div>
              </form>
            ) : (
              <form id="otp-form" onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input id="otp" placeholder="1234" required type="text" maxLength={4} className="text-center text-2xl tracking-widest h-12" />
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {step === 1 ? (
              <Button type="submit" form="login-form" className="w-full">
                Send OTP
              </Button>
            ) : (
              <>
                <Button type="submit" form="otp-form" className="w-full">
                  Verify & Sign In
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
                  Back
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
