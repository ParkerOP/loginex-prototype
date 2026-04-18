"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("SHIPPER");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleLogin = async () => {
    if (otp.length !== 4) {
      setError("Please enter a 4-digit OTP");
      return;
    }
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      phone,
      otp,
      role,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid OTP");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">LogineX Login</CardTitle>
          <CardDescription>Sign in or create an account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={step === 2 || loading}
            />
          </div>

          {step === 1 && (
            <div className="space-y-2 mt-4">
              <Label>I am a:</Label>
              <RadioGroup
                value={role}
                onValueChange={setRole}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SHIPPER" id="r1" />
                  <Label htmlFor="r1" className="cursor-pointer">
                    Shipper (Post loads)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DRIVER" id="r2" />
                  <Label htmlFor="r2" className="cursor-pointer">
                    Driver (Find loads)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2 animate-in fade-in zoom-in duration-300">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter any 4 digits"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                For prototype, any 4-digit number works.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {step === 1 ? (
            <Button className="w-full" onClick={handleSendOtp}>
              Send OTP
            </Button>
          ) : (
            <>
              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
