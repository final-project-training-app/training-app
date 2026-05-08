export default async function fetchMyProfile() {
  const res = await fetch("/api/users/me/profile", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return res.json();
}
