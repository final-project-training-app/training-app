/**
 * Single source of truth for the backend origin used by the browser.
 * Must match the logic in `api/users.ts` so profile GET and PUT hit the same host.
 */
export function getApiBaseUrl(): string {
  return (
    import.meta.env.VITE_API_URL ??
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://backend-training.up.railway.app")
  ).replace(/\/$/, "");
}
