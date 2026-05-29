const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:4000";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN ?? "dev-admin-token";

async function parseAdminResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Admin request failed: ${response.status}${message ? ` ${message}` : ""}`);
  }

  return response.json() as Promise<T>;
}

export async function adminGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}/api/admin${path}`, {
    headers: { "x-admin-token": ADMIN_TOKEN }
  });

  return parseAdminResponse<T>(response);
}

export async function adminPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}/api/admin${path}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", "x-admin-token": ADMIN_TOKEN },
    body: JSON.stringify(body)
  });

  return parseAdminResponse<T>(response);
}
