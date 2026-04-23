"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePerformance } from "@/components/providers/performance-context";
import { motion } from "framer-motion";
import { Save, Bell, Shield, Smartphone, Globe, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { reduceMotion, setReduceMotion } = usePerformance();
  const [loading, setLoading] = useState(false);
  const isDriver = (session?.user as any)?.role === "DRIVER";

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    smsAlerts: isDriver ? true : false,
    locationTracking: isDriver ? true : false,
    darkMode: true, // Assuming dark mode by default based on layout
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Settings saved successfully.");
    }, 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Manage your account preferences and application settings.
        </p>
      </div>

      <motion.div
        variants={reduceMotion ? {} : containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Appearance & Performance */}
        <motion.div variants={reduceMotion ? {} : itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle>Appearance & Performance</CardTitle>
              </div>
              <CardDescription>
                Customize how the application looks and performs on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="reduce-motion">Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Disables heavy animations. Recommended for older devices or to save battery.
                  </p>
                </div>
                <Switch
                  id="reduce-motion"
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode" className="flex items-center gap-2">
                    {settings.darkMode ? <Moon className="h-4 w-4"/> : <Sun className="h-4 w-4"/>}
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle dark theme. Currently locked to dark mode in prototype.
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  disabled
                  onCheckedChange={() => handleToggle('darkMode')}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={reduceMotion ? {} : itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Choose what alerts you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notif">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on this device.
                  </p>
                </div>
                <Switch
                  id="push-notif"
                  checked={settings.notifications}
                  onCheckedChange={() => handleToggle('notifications')}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="email-alerts">Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily summaries and important updates via email.
                  </p>
                </div>
                <Switch
                  id="email-alerts"
                  checked={settings.emailAlerts}
                  onCheckedChange={() => handleToggle('emailAlerts')}
                />
              </div>
              {isDriver && (
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-alerts">SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get instantly notified via SMS when a new load matches your criteria.
                    </p>
                  </div>
                  <Switch
                    id="sms-alerts"
                    checked={settings.smsAlerts}
                    onCheckedChange={() => handleToggle('smsAlerts')}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div variants={reduceMotion ? {} : itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Privacy & Security</CardTitle>
              </div>
              <CardDescription>
                Manage your data and privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isDriver && (
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="location-tracking" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Background Location
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow LogineX to access your location in the background for accurate ETA tracking during active trips.
                    </p>
                  </div>
                  <Switch
                    id="location-tracking"
                    checked={settings.locationTracking}
                    onCheckedChange={() => handleToggle('locationTracking')}
                  />
                </div>
              )}
              <div className="pt-4 flex flex-col gap-2">
                <Button variant="outline" className="w-full sm:w-auto self-start">Change Password</Button>
                <Button variant="destructive" className="w-full sm:w-auto self-start bg-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground border-transparent">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={reduceMotion ? {} : itemVariants} className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto px-8">
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
