const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
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

  return res.json();
}
