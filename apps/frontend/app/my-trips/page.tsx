export default function MyTripsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Trips</h1>
      </div>
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        <p>Your active and completed trips will appear here.</p>
      </div>
    </div>
  );
}
