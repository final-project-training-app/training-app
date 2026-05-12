const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "");

export async function fetchTrainers() {
  const url = `${API_BASE}/api/trainers`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to load trainers.");
  }

  return res.json();
}
