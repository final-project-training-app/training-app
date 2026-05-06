const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string) {
  const response = await fetch(`${API_URL}${path}`);

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
