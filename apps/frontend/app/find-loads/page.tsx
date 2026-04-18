export default function FindLoadsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Find Loads</h1>
      </div>
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        <p>Available loads for your vehicle will appear here.</p>
        <p className="text-sm mt-2">Driver Matching UI coming soon.</p>
      </div>
    </div>
  );
}
