export async function apiFetch(path: string, init?: RequestInit) {
  const response = await fetch(path, init);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response;
}

export async function getJson<T>(path: string) {
  const response = await apiFetch(path);
  return response.json() as Promise<T>;
}
