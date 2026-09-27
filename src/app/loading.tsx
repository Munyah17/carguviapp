export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-6">
      <div className="h-8 w-64 rounded-lg bg-surface-100" />
      <div className="mt-2 h-4 w-96 max-w-full rounded bg-surface-100" />
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-surface-100" />
        ))}
      </div>
    </div>
  );
}
