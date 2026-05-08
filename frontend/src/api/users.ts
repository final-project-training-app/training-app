const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
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
