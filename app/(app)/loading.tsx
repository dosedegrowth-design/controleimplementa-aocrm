export default function Loading() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-slate-100 rounded animate-pulse" />
      <div className="h-96 bg-slate-100 rounded animate-pulse" />
    </div>
  );
}
