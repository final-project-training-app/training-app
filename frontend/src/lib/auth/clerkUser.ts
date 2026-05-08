const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

type CreateCurrentUserInput = {
  token: string;
  displayName: string;
};

export async function createCurrentUser({
  token,
  displayName,
}: CreateCurrentUserInput) {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ displayName }),
  });

  if (response.status === 409) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}
