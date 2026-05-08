import { GeminiLiveTest } from "./live/GeminiLiveTest";

export function AiDevPage() {
  return (
    <main className="min-h-dvh bg-(--brand-page) px-6 py-10 text-(--brand-ink)">
      <section className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-(--brand-primary)">
            AI Dev Page
          </h1>
          <p className="mt-2 text-lg text-(--brand-muted)">
            Ren sandbox för Gemini Live, function calling och deployade backend-endpoints.
          </p>
        </div>

        <GeminiLiveTest />
      </section>
    </main>
  );
}
