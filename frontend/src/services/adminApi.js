const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MOCK = import.meta.env.VITE_USE_MOCK === "true";

/* ---------- MOCK (test sans backend) ---------- */
let db = [
  { id: 1, firstName: "Sami", lastName: "Ben Ali", email: "sami@mail.com", phone: "+216 22 111 222", role: "doctor", specialty: "cardiologue", licenseNumber: "C-1021", status: "pending", diplomaUrl: "#", createdAt: "2026-10-10" },
  { id: 2, firstName: "Ines", lastName: "Trabelsi", email: "ines@mail.com", phone: "+216 55 333 444", role: "doctor", specialty: "dermatologue", licenseNumber: "D-3345", status: "pending", diplomaUrl: "#", createdAt: "2026-10-12" },
  { id: 3, firstName: "Karim", lastName: "Jlassi", email: "karim@mail.com", phone: "+216 98 000 111", role: "doctor", specialty: "cardiologue", licenseNumber: "C-0870", status: "active", createdAt: "2026-09-02" },
  { id: 4, firstName: "Maram", lastName: "Gharbi", email: "maram@mail.com", phone: "+216 21 456 789", role: "patient", status: "active", createdAt: "2026-09-20" },
  { id: 5, firstName: "Youssef", lastName: "Hamdi", email: "youssef@mail.com", phone: "+216 50 654 321", role: "patient", status: "active", createdAt: "2026-10-01" },
  { id: 6, firstName: "Rim", lastName: "Mejri", email: "rim@mail.com", phone: "+216 29 888 777", role: "patient", status: "banned", createdAt: "2026-08-15" },
];
const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 300));
const setStatus = (id, status) => {
  db = db.map((u) => (u.id === id ? { ...u, status } : u));
  return wait({ ok: true });
};

const mock = {
  getStats: () =>
    wait({
      doctors: db.filter((u) => u.role === "doctor" && u.status === "active").length,
      patients: db.filter((u) => u.role === "patient" && u.status !== "banned").length,
      pending: db.filter((u) => u.status === "pending").length,
      banned: db.filter((u) => u.status === "banned").length,
    }),
  getPending: () => wait(db.filter((u) => u.status === "pending")),
  getUsers: () => wait(db.filter((u) => u.status !== "pending")),
  approve: (id) => setStatus(id, "active"),
  reject: (id) => setStatus(id, "rejected"),
  ban: (id) => setStatus(id, "banned"),
  unban: (id) => setStatus(id, "active"),
  remove: (id) => {
    db = db.filter((u) => u.id !== id);
    return wait({ ok: true });
  },
};

/* ---------- API réelle ---------- */
async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Erreur serveur");
  }
  return res.status === 204 ? null : res.json();
}

const real = {
  getStats: () => request("/admin/stats"),
  getPending: () => request("/admin/doctors/pending"),
  getUsers: () => request("/admin/users"),
  approve: (id) => request(`/admin/doctors/${id}/approve`, { method: "PATCH" }),
  reject: (id, reason) =>
    request(`/admin/doctors/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) }),
  ban: (id) => request(`/admin/users/${id}/ban`, { method: "PATCH" }),
  unban: (id) => request(`/admin/users/${id}/unban`, { method: "PATCH" }),
  remove: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
};

export const adminApi = MOCK ? mock : real;