export default function Loading() {
  return (
    <main className="min-h-screen bg-night px-6 py-10 text-paper" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="h-12 w-44 animate-pulse rounded-full bg-white/10" />
        <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8">
            <div className="h-8 w-36 animate-pulse rounded-full bg-ember-500/25" />
            <div className="mt-8 h-24 w-full animate-pulse rounded-3xl bg-white/10" />
            <div className="mt-5 h-6 w-4/5 animate-pulse rounded-full bg-white/10" />
            <div className="mt-3 h-6 w-2/3 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8">
            <div className="h-full min-h-80 animate-pulse rounded-3xl bg-white/10" />
          </div>
        </div>
      </div>
    </main>
  );
}
