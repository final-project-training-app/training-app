export async function apiFetch(path: string, init?: RequestInit) {
  const response = await fetch(path, init);

  if (!response.ok) {
    const text = await response.text();

    if (response.status === 404) {
      throw new Error("Kunde inte hitta övningen.");
    }

    if (response.status >= 500) {
      throw new Error("Serverfel. Försök igen om en stund.");
    }

    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response;
}

export async function getJson<T>(path: string) {
  const response = await apiFetch(path);
  return response.json() as Promise<T>;
}
