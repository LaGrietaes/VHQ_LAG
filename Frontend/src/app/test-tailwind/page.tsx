export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-4">Tailwind Test</h1>
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-card-foreground mb-4">This is a test card with proper styling.</p>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
} 