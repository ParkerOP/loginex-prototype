import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Activity, Plus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your shipments and recent activity.
          </p>
        </div>
        <Link href="/loads/new" passHref><Button render={<Link href="/loads/new" />}>
            <Plus className="mr-2 h-4 w-4" /> Post New Load
          </Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 since last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Drivers on the road
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +14% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Loads</CardTitle>
            <CardDescription>
              Your most recently posted and active loads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Warehouse A to Retail Store {i}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tata Ace • 1.2 Tonnes
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={i === 1 ? "default" : "secondary"}>
                      {i === 1 ? "In Transit" : "Matching"}
                    </Badge>
                    <Button variant="ghost" size="sm" render={<Link href="/loads/new" />}>
                      <Link href={`/loads/${i}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Action Needed</CardTitle>
            <CardDescription>
              Tasks requiring your attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="rounded-lg border p-3 bg-muted/50">
                  <p className="text-sm font-medium">Approve POD for Trip #892</p>
                  <p className="text-xs text-muted-foreground mt-1">Driver: Raj Kumar</p>
                  <Button size="sm" className="mt-3 w-full">Review Document</Button>
               </div>
               <div className="rounded-lg border p-3 bg-muted/50">
                  <p className="text-sm font-medium">Pending Invoice Payment</p>
                  <p className="text-xs text-muted-foreground mt-1">Amount: ₹1,450.00</p>
                  <Button size="sm" variant="outline" className="mt-3 w-full">Pay via Razorpay</Button>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
