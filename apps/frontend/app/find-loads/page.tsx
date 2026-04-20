"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchApi } from "@/lib/api/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Define a basic interface for the Load and Match response
interface Load {
  id: string;
  originCity: string;
  originAddress: string;
  destinationCity: string;
  destinationAddress: string;
  requiredVehicleType: string;
  cargoDescription: string;
  scheduledTime: string;
}

interface MatchResult {
  load: Load;
  score: number;
}

export default function FindLoadsPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState<string | null>(null);

  const [cityFilter, setCityFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string | null>("ALL");

  useEffect(() => {
    if (session?.user) {
      fetchMatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, cityFilter, vehicleTypeFilter]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (cityFilter) queryParams.append("city", cityFilter);
      if (vehicleTypeFilter && vehicleTypeFilter !== "ALL") queryParams.append("vehicleType", vehicleTypeFilter);

      const response = await fetchApi(`/matches/available?${queryParams.toString()}`, { session });
      setMatches(response.matches || []);
    } catch (error) {
      console.error("Failed to fetch matches", error);
      toast.error("Failed to load available matches");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestMatch = async (loadId: string) => {
    setSuggesting(loadId);
    try {
      await fetchApi(`/matches/suggest`, {
        method: "POST",
        session,
        body: JSON.stringify({ loadId }),
      });
      toast.success("Match suggestion sent successfully!");
      // Remove the load from the list after successful suggestion
      setMatches(prevMatches => prevMatches.filter(m => m.load.id !== loadId));
    } catch (error: unknown) {
      console.error("Failed to suggest match", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to suggest match";
      toast.error(errorMessage);
    } finally {
      setSuggesting(null);
    }
  };

  if (!session) {
    return <div>Please log in to view available loads.</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Find Loads</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Filter by city (e.g., Delhi, Mumbai)"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select value={vehicleTypeFilter ?? undefined} onValueChange={(val: string | null) => setVehicleTypeFilter(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Vehicle Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="TATA_ACE">Tata Ace</SelectItem>
            <SelectItem value="14_FT">14 FT</SelectItem>
            <SelectItem value="19_FT">19 FT</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center p-8">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          <p>No available loads match your profile or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map(({ load, score }) => (
            <Card key={load.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start text-lg">
                  <span>{load.originCity} ➔ {load.destinationCity}</span>
                  <span className="text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Score: {score}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Cargo:</strong> {load.cargoDescription}</p>
                <p><strong>Required Vehicle:</strong> {load.requiredVehicleType}</p>
                <p><strong>Pickup Time:</strong> {new Date(load.scheduledTime).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  From: {load.originAddress} <br/>
                  To: {load.destinationAddress}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSuggestMatch(load.id)}
                  disabled={suggesting === load.id}
                >
                  {suggesting === load.id ? "Suggesting..." : "Suggest Match"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
