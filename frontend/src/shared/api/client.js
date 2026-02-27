import { tokenStorage } from "@/shared/auth/tokenStorage";

export function setToken(token) {
  tokenStorage.set(token);
}
export function getToken() {
  return tokenStorage.get();
}
export function clearToken() {
  tokenStorage.clear();
}

async function request(path, { method = "GET", headers = {}, body } = {}) {
  const token = getToken();

  const finalHeaders = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`/api${path}`, {
    method,
    headers: finalHeaders,
    body,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
  }

  const msg =
    (data &&
      data.detail &&
      (typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail))) ||
    (typeof data === "string" && data) ||
    `Request failed (${res.status})`;

  const err = new Error(msg);
  err.status = res.status;
  err.data = data;
  throw err;
}

  return data;
}

// ---- Auth ----
export async function register({ username, email, password }) {
  return request("/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login({ username, password }) {
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);

  const data = await request("/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const token = data?.access_token || data?.token;
  if (!token) throw new Error("Login OK but no token returned by backend.");
  setToken(token);
  return data;
}

// ---- Groups ----
export async function createGroup({ name, description }) {
  return request("/groups/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
}

export async function joinGroup(groupId) {
  return request(`/groups/${groupId}/join`, { method: "POST" });
}