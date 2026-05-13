const API_URL = (
  import.meta.env.VITE_API_URL ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://backend-training.up.railway.app")
).replace(/\/$/, "");

export default async function fetchMyProfile(token: string) {
  const res = await fetch(`${API_URL}/api/users/me/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return res.json();
}
