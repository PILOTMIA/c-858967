import CompoundingPlanner from "@/components/CompoundingPlanner";

export default function Compounding() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <h1 className="sr-only">Compounding planner</h1>
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-16">
        <CompoundingPlanner />
      </div>
    </main>
  );
}