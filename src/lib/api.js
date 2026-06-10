const BASE = import.meta.env.VITE_API_URL || "https://syllabi-x.onrender.com/api"

function getToken() {
  return localStorage.getItem("access_token")
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.error || "Request failed")
    err.status = res.status
    throw err
  }

  return data
}

export const api = {
  register: (body)  => request("/register",        { method: "POST", body: JSON.stringify(body) }),
  login:    (body)  => request("/login",            { method: "POST", body: JSON.stringify(body) }),
  logout:   ()      => request("/logout",           { method: "POST" }),
  forgotPw: (email) => request("/forgot-password",  { method: "POST", body: JSON.stringify({ email }) }),
  googleAuth:(body) => request("/google-auth",      { method: "POST", body: JSON.stringify(body) }),
  profile:  ()      => request("/profile"),
  updateProfile: (body) => request("/profile",      { method: "PUT", body: JSON.stringify(body) }),
  resetPw:  (token, password) => request("/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),
  health:   ()      => request("/health"),
  getHistory: (role) => request(`/history?role=${role}`),
  addHistory: (body) => request("/history", { method: "POST", body: JSON.stringify(body) }),
  deleteHistory: (id) => request(`/history/${id}`, { method: "DELETE" }),
  updateExportStatus: (id, type, status) => request(`/history/${id}/export`, { method: "PUT", body: JSON.stringify({ type, status }) }),
}

