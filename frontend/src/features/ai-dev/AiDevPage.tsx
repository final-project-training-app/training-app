// frontend/src/features/ai-dev/AiDevPage.tsx
import { useState } from "react";
import { runSimpleFunctionCall } from "./runSimpleFunctionCall";

// ------------------------------------------------------------------
// AI DEV PAGE (Sandbox UI)
// Det här är pusslets presentationslager. Denna route är enbart till
// för AI-teamet för att testa att hela function calling-flödet fungerar
// från frontend till Gemini och tillbaka igen.
// ------------------------------------------------------------------
export function AiDevPage() {
  const [loading, setLoading] = useState(false);
  const [modelText, setModelText] = useState("");
  const [debugData, setDebugData] = useState<unknown>(null);
  const [error, setError] = useState("");

  async function handleRunSimpleTool() {
    setLoading(true);
    setError("");
    setModelText("");
    setDebugData(null);

    try {
      const result = await runSimpleFunctionCall();
      setModelText(result.modelText);
      setDebugData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-(--brand-page) px-6 py-10 text-(--brand-ink)">
      <section className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-(--brand-primary)">
            AI Dev Page
          </h1>
          <p className="mt-2 text-lg text-(--brand-muted)">
            Minimal sandbox for Gemini function calling.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRunSimpleTool()}
          disabled={loading}
          className="rounded-xl bg-(--brand-primary) px-6 py-4 text-lg font-bold text-(--brand-on-primary) disabled:opacity-60"
        >
          {loading ? "Running..." : "Run simple tool"}
        </button>

        {error ? (
          <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </section>
        ) : null}

        <section className="rounded-xl border border-(--brand-border) bg-(--brand-surface) p-4">
          <h2 className="text-xl font-bold">Model response</h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm">{modelText}</pre>
        </section>

        <section className="rounded-xl border border-(--brand-border) bg-(--brand-surface) p-4">
          <h2 className="text-xl font-bold">Debug data</h2>
          <pre className="mt-3 whitespace-pre-wrap text-xs">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </section>
      </section>
    </main>
  );
}
