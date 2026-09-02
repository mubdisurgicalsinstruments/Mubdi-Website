export default function ProductsLoading() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-7xl animate-pulse px-5 py-12 sm:px-8 lg:px-10">
        <div className="h-3 w-28 rounded bg-border" />
        <div className="mt-5 h-10 w-72 max-w-full rounded bg-border" />
        <div className="mt-4 h-4 w-full max-w-xl rounded bg-border-light" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-11 rounded bg-white" />
            ))}
          </div>
          <div className="aspect-[1.27/1] rounded-2xl bg-border-light" />
        </div>
      </div>
    </main>
  );
}
