import { request } from "./apiClient";

const MOCK = import.meta.env.VITE_USE_MOCK === "true";

/* ---------- Traduction backend -> format utilisé par l'interface ---------- */
const normalizeSpecialty = (s) => {
  const v = String(s || "").trim().toLowerCase();
  if (v.startsWith("cardio")) return "cardiologue";
  if (v.startsWith("derma")) return "dermatologue";
  return v || undefined;
};

function normalize(u) {
  const isDoctor = u.role === "medecin";
  let status = "active";
  if (u.estActif === false) status = "banned";
  else if (isDoctor) {
    status = u.statut === "en_attente" ? "pending" : u.statut === "refuse" ? "rejected" : "active";
  }
  return {
    id: u._id,
    firstName: u.prenom,
    lastName: u.nom,
    email: u.email,
    phone: u.telephone,
    role: isDoctor ? "doctor" : u.role,
    specialty: normalizeSpecialty(u.specialite),
    licenseNumber: u.numeroOrdre,
    justificatifsCount: u.justificatifs?.length ?? 0,
    status,
    createdAt: u.createdAt,
  };
}

/* ---------------------------- API réelle ---------------------------- */
const fetchAll = async () => {
  const data = await request("/admin/users");
  return data.users.map(normalize);
};

const real = {
  async getStats() {
    const all = await fetchAll();
    return {
      doctors: all.filter((u) => u.role === "doctor" && u.status === "active").length,
      patients: all.filter((u) => u.role === "patient" && u.status === "active").length,
      pending: all.filter((u) => u.status === "pending").length,
      banned: all.filter((u) => u.status === "banned").length,
    };
  },

  async getPending() {
    const data = await request("/admin/medecins?statut=en_attente");
    return data.medecins.map(normalize).filter((u) => u.status === "pending");
  },

  async getUsers() {
    const all = await fetchAll();
    return all.filter((u) => u.status !== "pending");
  },

  approve: (id) => request(`/admin/medecins/${id}/valider`, { method: "PATCH" }),
  reject: (id, motif) =>
    request(`/admin/medecins/${id}/refuser`, { method: "PATCH", body: { motif } }),
  ban: (id, motif) =>
    request(`/admin/users/${id}/bannir`, { method: "PATCH", body: { motif } }),
  unban: (id) => request(`/admin/users/${id}/debannir`, { method: "PATCH" }),
  remove: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),

  // Le justificatif est protégé par le token : on le télécharge puis on l'ouvre
  async openJustificatif(id, index) {
    const win = window.open("about:blank", "_blank"); // dans le clic, pour éviter le blocage
    try {
      const res = await request(`/admin/medecins/${id}/justificatifs/${index}`, { raw: true });
      const url = URL.createObjectURL(await res.blob());
      if (win) win.location.href = url;
      else window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      win?.close();
      throw e;
    }
  },
};

/* ---------------- MOCK (test sans backend : VITE_USE_MOCK=true) ---------------- */
let db = [
  { id: 1, firstName: "Sami", lastName: "Ben Ali", email: "sami@mail.com", phone: "+216 22 111 222", role: "doctor", specialty: "cardiologue", licenseNumber: "C-1021", status: "pending", justificatifsCount: 1, createdAt: "2026-10-10" },
  { id: 2, firstName: "Ines", lastName: "Trabelsi", email: "ines@mail.com", phone: "+216 55 333 444", role: "doctor", specialty: "dermatologue", licenseNumber: "D-3345", status: "pending", justificatifsCount: 1, createdAt: "2026-10-12" },
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
      patients: db.filter((u) => u.role === "patient" && u.status === "active").length,
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
  openJustificatif: async () => {
    window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
  },
};

export const adminApi = MOCK ? mock : real;