const API_BASE = import.meta.env.VITE_API_BASE ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "");

export async function createWorkout(data: unknown) {
  const url = `${API_BASE}/api/workouts`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to create workout.");
  }

  return res.json();
}
