const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "");

export async function fetchFeedbacksWithToken(token: string) {
  const res = await fetch(`${API_BASE}/api/feedbacks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to load feedback.");
  }

  return res.json();
}
