import { CommentsSectionFallback } from "@/components/comments/comments-section-fallback"

export default function BlogEntryLoading() {
  return (
    <div className="space-y-10">
      <section className="space-y-7 rounded-3xl border border-primary/12 bg-gradient-to-br from-secondary/70 via-card to-card p-6 sm:p-8">
        <div className="space-y-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-primary/12" />
          <div className="space-y-3">
            <div className="h-12 w-full max-w-4xl animate-pulse rounded-[1.5rem] bg-primary/10" />
            <div className="h-12 w-4/5 max-w-3xl animate-pulse rounded-[1.5rem] bg-primary/8" />
          </div>
          <div className="space-y-3">
            <div className="h-5 w-full max-w-3xl animate-pulse rounded-full bg-primary/8" />
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-primary/8" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-16 animate-pulse rounded-2xl bg-primary/8" />
          <div className="h-16 animate-pulse rounded-2xl bg-primary/8" />
          <div className="h-16 animate-pulse rounded-2xl bg-primary/8" />
        </div>
      </section>

      <section className="space-y-5">
        <div className="h-6 w-40 animate-pulse rounded-full bg-primary/8" />
        <div className="space-y-4">
          <div className="h-5 w-full animate-pulse rounded-full bg-primary/8" />
          <div className="h-5 w-11/12 animate-pulse rounded-full bg-primary/8" />
          <div className="h-5 w-5/6 animate-pulse rounded-full bg-primary/8" />
          <div className="h-5 w-full animate-pulse rounded-full bg-primary/8" />
          <div className="h-5 w-3/4 animate-pulse rounded-full bg-primary/8" />
        </div>
        <div className="space-y-3 rounded-[2rem] border border-primary/10 bg-card/70 p-6">
          <div className="h-8 w-2/5 animate-pulse rounded-full bg-primary/10" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-full bg-primary/8" />
            <div className="h-4 w-10/12 animate-pulse rounded-full bg-primary/8" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-primary/8" />
          </div>
        </div>
      </section>

      <CommentsSectionFallback />

      <nav className="grid gap-4 border-t border-primary/15 pt-8 sm:grid-cols-2">
        <div className="space-y-3 rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary/65 via-card to-card p-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-primary/10" />
          <div className="h-5 w-4/5 animate-pulse rounded-full bg-primary/8" />
          <div className="h-4 w-full animate-pulse rounded-full bg-primary/8" />
        </div>
        <div className="space-y-3 rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary/65 via-card to-card p-4">
          <div className="ml-auto h-3 w-24 animate-pulse rounded-full bg-primary/10" />
          <div className="ml-auto h-5 w-4/5 animate-pulse rounded-full bg-primary/8" />
          <div className="ml-auto h-4 w-full animate-pulse rounded-full bg-primary/8" />
        </div>
      </nav>
    </div>
  )
}
