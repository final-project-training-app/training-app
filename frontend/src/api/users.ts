import { getApiBaseUrl } from "../lib/apiBaseUrl";

const API_URL = getApiBaseUrl();

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
