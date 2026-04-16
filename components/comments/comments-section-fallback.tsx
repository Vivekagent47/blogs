export function CommentsSectionFallback() {
  return (
    <section
      id="comments"
      className="comments-stage scroll-m-24 space-y-6 rounded-[2.5rem] border border-primary/10 p-6 sm:p-8"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          Discussion
        </p>
        <div className="h-8 w-56 animate-pulse rounded-full bg-primary/10" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded-full bg-primary/8" />
          <div className="h-4 w-4/5 animate-pulse rounded-full bg-primary/8" />
        </div>
      </div>

      <div className="comments-paper space-y-4 rounded-[2rem] border border-primary/10 p-5">
        <div className="flex items-center gap-3">
          <div className="size-11 animate-pulse rounded-full bg-primary/12" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-full bg-primary/10" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-primary/8" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded-full bg-primary/8" />
          <div className="h-4 w-11/12 animate-pulse rounded-full bg-primary/8" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-primary/8" />
        </div>
      </div>
    </section>
  )
}

export function CommentsSectionUnavailable() {
  return (
    <section
      id="comments"
      className="comments-stage scroll-m-24 space-y-4 rounded-[2.5rem] border border-primary/10 p-6 sm:p-8"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          Discussion
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">Comments temporarily unavailable</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          The article is fine, but the comments backend is not ready yet. Check the server logs and
          Supabase setup if this should already be online.
        </p>
      </div>
    </section>
  )
}
