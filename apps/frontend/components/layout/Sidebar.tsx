"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Truck,
  CreditCard,
  Settings,
  Search,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const shipperItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Loads", href: "/loads", icon: Package },
  { name: "Drivers", href: "/drivers", icon: Truck },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Admin", href: "/admin", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

const driverItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Find Loads", href: "/find-loads", icon: Search },
  { name: "My Trips", href: "/my-trips", icon: MapPin },
  { name: "Earnings", href: "/earnings", icon: CreditCard },
  { name: "Admin", href: "/admin", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Default to shipper if no session (or loading), but we could handle this better
  const role = (session?.user as { role?: string })?.role || "SHIPPER";

  const items = role === "DRIVER" ? driverItems : shipperItems;

  return (
    <div className="hidden border-r bg-muted/40 md:block w-64 flex-shrink-0">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Truck className="h-6 w-6" />
            <span className="">
              LogineX {role === "DRIVER" ? "Driver" : "Shipper"}
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href
                    ? "bg-muted text-primary"
                    : "hover:bg-muted",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
