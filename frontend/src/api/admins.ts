const API_URL = (
  import.meta.env.VITE_API_URL ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://backend-training.up.railway.app")
).replace(/\/$/, "");

export default async function fetchAdminPage(token: string) {
  const res = await fetch(`${API_URL}/api/admin`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Not authorized");
  }

  return res.text(); //for now it is text, but in the future it could be JSON or something else depending on what the admin page needs
}
