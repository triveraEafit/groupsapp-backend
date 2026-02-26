const TOKEN_KEY = "groupsapp_token";

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
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

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const msg =
      (data && data.detail && (typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail))) ||
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
  // OAuth2 password form => application/x-www-form-urlencoded
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);

  // grant_type optional; some implementations require it
  // form.set("grant_type", "password");

  const data = await request("/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  // Common FastAPI response: { access_token, token_type }
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