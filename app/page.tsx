import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Qapybara
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
        New App
      </h1>
      <p className="max-w-2xl text-zinc-700">
        Foundation is ready. Start implementing your product from this screen.
      </p>
      <div>
        <Button>Start Building</Button>
      </div>
    </main>
  );
}
