export function BookCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] overflow-hidden animate-pulse">
      <div className="aspect-[2/3] w-full bg-[var(--color-surface-container-high)]" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="h-4 w-3/4 rounded-md bg-[var(--color-surface-container-high)]" />
        <div className="h-3 w-1/2 rounded-md bg-[var(--color-surface-container-high)]" />
        <div className="h-3 w-1/3 rounded-md bg-[var(--color-surface-container-high)] mt-1" />
      </div>
    </div>
  )
}
