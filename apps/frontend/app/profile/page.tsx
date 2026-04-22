"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Shield } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role || "Unknown";

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full mt-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account details and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Your basic profile details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={session?.user?.name || ""} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
               <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input id="email" type="email" defaultValue={session?.user?.email || ""} className="pl-9" readOnly />
            </div>
          </div>

          <div className="space-y-2">
             <Label htmlFor="phone">Phone Number</Label>
             <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" defaultValue={(session?.user?.email || "").split('@')[0]} className="pl-9" readOnly />
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
         <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Shield className="h-5 w-5 text-primary" />
               Account Role
             </CardTitle>
         </CardHeader>
         <CardContent>
             <div className="bg-muted/50 p-4 rounded-lg flex justify-between items-center">
                 <div>
                     <p className="font-medium text-lg capitalize">{role.toLowerCase()}</p>
                     <p className="text-sm text-muted-foreground">This is your current account type in the platform.</p>
                 </div>
                 <Button variant="outline" disabled>Change Role</Button>
             </div>
         </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button disabled>Save Changes</Button>
      </div>
    </div>
  );
}
