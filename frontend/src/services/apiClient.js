export const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Appel HTTP vers le backend.
 * - body objet  -> JSON
 * - body FormData -> multipart (le navigateur gère le Content-Type)
 * - raw: true -> renvoie la Response brute (pour télécharger un fichier)
 */
export async function request(path, { method = "GET", body, raw = false } = {}) {
  const token = localStorage.getItem("token");
  const isForm = body instanceof FormData;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(body && !isForm && { "Content-Type": "application/json" }),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new Error("Impossible de joindre le serveur. Vérifiez que le backend est démarré.");
  }

  if (!res.ok) {
    // Session expirée : retour à la connexion
    if (res.status === 401 && token && !path.startsWith("/auth/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message || err.errors?.[0]?.msg || err.errors?.[0]?.message || "Erreur serveur"
    );
  }

  if (raw) return res;
  return res.status === 204 ? null : res.json();
}