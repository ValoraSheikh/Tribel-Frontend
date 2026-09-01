export function NewPropertiesSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-36 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border bg-card">
            <div className="aspect-square animate-pulse bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Route-level fallback that mirrors the real page order:
 * hero block first, then the properties grid — so the brief
 * navigation flash matches what will replace it.
 */
export default function DiscoverLoading() {
  return (
    <>
      <div className="bg-gray-900" aria-hidden="true">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center sm:py-64">
          <div className="h-10 w-80 max-w-full animate-pulse rounded bg-white/20" />
          <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-white/20" />
          <div className="mt-8 h-12 w-44 animate-pulse rounded-md bg-white/20" />
        </div>
      </div>
      <NewPropertiesSkeleton />
    </>
  );
}
