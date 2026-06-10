export const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

export function resolveBackendUrl(path) {
  if (!path) return "";
  return /^https?:\/\//i.test(path) ? path : `${backendUrl}${path}`;
}