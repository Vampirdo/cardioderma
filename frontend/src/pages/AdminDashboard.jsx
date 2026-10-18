import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, Ban, CalendarDays, Check, FileText, Inbox, LayoutDashboard,
  LogOut, Mail, Phone, RefreshCw, RotateCcw, Search, ShieldCheck,
  Stethoscope, Trash2, User, UserCheck, Users, X,
} from "lucide-react";
import Logo from "../components/Logo";
import { adminApi } from "../services/adminApi";

/* ------------------------------ Constantes ------------------------------ */
const SPECIALTY = { cardiologue: "Cardiologue", dermatologue: "Dermatologue" };

const STATUS = {
  active: ["Actif", "bg-emerald-50 text-emerald-700", "bg-emerald-500"],
  pending: ["En attente", "bg-amber-50 text-amber-700", "bg-amber-500"],
  banned: ["Banni", "bg-coral-soft text-coral", "bg-coral"],
  rejected: ["Refusé", "bg-gray-100 text-gray-600", "bg-gray-400"],
};

const NAV = [
  { key: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { key: "pending", label: "Demandes médecins", icon: UserCheck },
  { key: "users", label: "Comptes", icon: Users },
];

const PAGES = {
  overview: ["Vue d'ensemble", "L'état de la plateforme en un coup d'œil."],
  pending: ["Demandes médecins", "Vérifiez les diplômes avant d'activer un compte."],
  users: ["Comptes", "Recherchez un compte, bannissez-le ou supprimez-le."],
};

const ACTIONS = {
  approve: {
    title: "Approuver ce médecin ?",
    desc: "Son compte sera activé et il pourra se connecter.",
    label: "Approuver", ok: "Médecin approuvé", icon: Check, danger: false,
  },
  reject: {
    title: "Refuser cette demande ?",
    desc: "Le médecin ne pourra pas se connecter. Vous pouvez indiquer un motif.",
    label: "Refuser", ok: "Demande refusée", icon: X, danger: true,
  },
  ban: {
    title: "Bannir ce compte ?",
    desc: "Il ne pourra plus se connecter tant que vous ne l'aurez pas débanni.",
    label: "Bannir", ok: "Compte banni", icon: Ban, danger: true,
  },
  unban: {
    title: "Débannir ce compte ?",
    desc: "Le compte retrouvera l'accès à l'application.",
    label: "Débannir", ok: "Compte réactivé", icon: RotateCcw, danger: false,
  },
  delete: {
    title: "Supprimer ce compte ?",
    desc: "Le compte et ses données seront supprimés définitivement.",
    label: "Supprimer", ok: "Compte supprimé", icon: Trash2, danger: true,
  },
};

/* ------------------------------ Utilitaires ----------------------------- */
const fullName = (u) => `${u.firstName} ${u.lastName}`;
const initials = (u) => `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();
const formatDate = (s) => {
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};
const specialtyTone = (s) => (s === "cardiologue" ? "bg-brand-50 text-brand-700" : "bg-coral-soft text-coral");

/* ------------------------------ Composants ------------------------------ */
function Avatar({ user, size = "h-11 w-11" }) {
  const tone =
    user.status === "banned"
      ? "bg-gray-100 text-gray-500"
      : user.role === "doctor"
      ? "bg-brand-100 text-brand-700"
      : "bg-coral-soft text-coral";
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full text-sm font-bold ${tone}`}>
      {initials(user)}
    </span>
  );
}

function Num({ value, skeleton = "bg-black/10" }) {
  if (value === null || value === undefined)
    return <span className={`inline-block h-8 w-14 animate-pulse rounded-lg align-middle ${skeleton}`} />;
  return <>{value}</>;
}

function SplitBar({ parts, track = "bg-brand-100" }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  return (
    <div className={`flex h-3 gap-0.5 overflow-hidden rounded-full ${track}`}>
      {total > 0 &&
        parts.map((p) => (
          <span
            key={p.label}
            className={`${p.color} transition-all duration-500`}
            style={{ width: `${(p.value / total) * 100}%` }}
          />
        ))}
    </div>
  );
}

function Legend({ items, light = false }) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
      {items.map((p) => (
        <div key={p.label} className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
          <span className={`text-sm ${light ? "text-white/75" : "text-brand-900/65"}`}>{p.label}</span>
          <span className="font-heading text-sm font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-brand-100/70 p-1">
      {options.map(([val, label]) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
            value === val ? "bg-white text-brand-900 shadow-sm" : "text-brand-900/55 hover:text-brand-900"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Empty({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-brand-500/30 bg-white px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon size={26} />
      </span>
      <p className="mt-4 font-heading text-base font-bold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-brand-900/55">{text}</p>
    </div>
  );
}

function PendingCard({ d, onApprove, onReject }) {
  return (
    <article className="rounded-2xl border border-brand-100 bg-white p-5 transition hover:border-brand-500/40 hover:shadow-sm">
      <div className="flex items-start gap-4">
        <Avatar user={d} size="h-12 w-12" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-bold">Dr {fullName(d)}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${specialtyTone(d.specialty)}`}>
              {SPECIALTY[d.specialty] ?? d.specialty}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-brand-900/55">N° d'ordre {d.licenseNumber}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-brand-900/70">
            <span className="flex items-center gap-1.5"><Mail size={14} className="text-brand-600" />{d.email}</span>
            <span className="flex items-center gap-1.5"><Phone size={14} className="text-brand-600" />{d.phone}</span>
            <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-brand-600" />{formatDate(d.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-100 pt-4">
        {d.diplomaUrl ? (
          <a
            href={d.diplomaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-100 px-3.5 py-2 text-sm font-semibold text-brand-900 transition hover:border-coral hover:text-coral"
          >
            <FileText size={16} /> Consulter les diplômes
          </a>
        ) : (
          <span className="text-sm text-brand-900/45">Aucun diplôme joint</span>
        )}
        <div className="flex gap-2">
          <button onClick={() => onReject(d)} className="btn-ghost">
            <X size={16} /> Refuser
          </button>
          <button onClick={() => onApprove(d)} className="btn-primary">
            <Check size={16} /> Approuver
          </button>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------- Page ---------------------------------- */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("overview");
  const [filters, setFilters] = useState({ search: "", role: "all", status: "all" });
  const [modal, setModal] = useState(null); // { action, user }
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const notify = useCallback((text, type = "ok") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, u] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPending(),
        adminApi.getUsers(),
      ]);
      setStats(s);
      setPending(p);
      setUsers(u);
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => e.key === "Escape" && !busy && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, busy]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return users.filter(
      (u) =>
        (filters.role === "all" || u.role === filters.role) &&
        (filters.status === "all" || u.status === filters.status) &&
        (!q || fullName(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [users, filters]);

  const bySpecialty = useMemo(() => {
    const docs = users.filter((u) => u.role === "doctor" && u.status === "active");
    return {
      cardio: docs.filter((u) => u.specialty === "cardiologue").length,
      derma: docs.filter((u) => u.specialty === "dermatologue").length,
    };
  }, [users]);

  const openModal = (action, user) => {
    setReason("");
    setModal({ action, user });
  };

  const runAction = async () => {
    const { action, user } = modal;
    setBusy(true);
    try {
      if (action === "approve") await adminApi.approve(user.id);
      if (action === "reject") await adminApi.reject(user.id, reason);
      if (action === "ban") await adminApi.ban(user.id);
      if (action === "unban") await adminApi.unban(user.id);
      if (action === "delete") await adminApi.remove(user.id);
      notify(ACTIONS[action].ok);
      setModal(null);
      await load();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const totalActive = stats ? stats.doctors + stats.patients : null;
  const cfg = modal && ACTIONS[modal.action];
  const [pageTitle, pageSubtitle] = PAGES[tab];

  return (
    <div className="min-h-screen bg-brand-50/60 lg:flex">
      {/* ------------------------- Menu latéral (desktop) ------------------------- */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between bg-brand-900 p-5 lg:flex">
        <div>
          <div className="px-2 pt-1">
            <Logo light />
          </div>
          <nav className="mt-10 space-y-1">
            {NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  tab === key ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{label}</span>
                {key === "pending" && pending.length > 0 && (
                  <span className="rounded-full bg-coral px-2 py-0.5 text-xs font-bold text-white">
                    {pending.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="rounded-2xl bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
              <ShieldCheck size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Administrateur</p>
              <p className="text-xs text-white/50">Accès complet</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <LogOut size={16} /> Se déconnecter
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* ------------------------- Barre du haut (mobile) ------------------------- */}
        <header className="bg-brand-900 px-4 pb-3 pt-4 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo light />
            <button onClick={logout} aria-label="Se déconnecter" className="rounded-xl bg-white/10 p-2.5 text-white">
              <LogOut size={18} />
            </button>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto">
            {NAV.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  tab === key ? "bg-white text-brand-900" : "bg-white/10 text-white/75"
                }`}
              >
                {label}
                {key === "pending" && pending.length > 0 && (
                  <span className="rounded-full bg-coral px-1.5 text-xs font-bold text-white">{pending.length}</span>
                )}
              </button>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 lg:px-10 lg:py-10">
          {/* En-tête de page */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-brand-900 lg:text-3xl">{pageTitle}</h1>
              <p className="mt-1 text-sm text-brand-900/60">{pageSubtitle}</p>
            </div>
            <button onClick={load} className="btn-ghost shrink-0 !px-3" aria-label="Actualiser" title="Actualiser">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* ============================ VUE D'ENSEMBLE ============================ */}
          {tab === "overview" && (
            <>
              {/* Cartes de chiffres */}
              <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Médecins", value: stats?.doctors, icon: Stethoscope, tone: "bg-brand-50 text-brand-600" },
                  { label: "Patients", value: stats?.patients, icon: User, tone: "bg-sky-50 text-sky-600" },
                  {
                    label: "Demandes en attente",
                    value: stats?.pending,
                    icon: UserCheck,
                    tone: "bg-amber-50 text-amber-600",
                    hover: "hover:border-amber-400",
                    onClick: () => setTab("pending"),
                  },
                  {
                    label: "Comptes bannis",
                    value: stats?.banned,
                    icon: Ban,
                    tone: "bg-coral-soft text-coral",
                    hover: "hover:border-coral",
                    onClick: () => {
                      setFilters({ search: "", role: "all", status: "banned" });
                      setTab("users");
                    },
                  },
                ].map(({ label, value, icon: Icon, tone, hover, onClick }) => {
                  const Tag = onClick ? "button" : "div";
                  return (
                    <Tag
                      key={label}
                      onClick={onClick}
                      className={`rounded-3xl border border-brand-100 bg-white p-5 text-left ${
                        onClick ? `transition ${hover}` : ""
                      }`}
                    >
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                        <Icon size={20} />
                      </span>
                      <p className="mt-4 font-heading text-3xl font-extrabold">
                        <Num value={value} />
                      </p>
                      <p className="mt-0.5 text-sm text-brand-900/60">{label}</p>
                    </Tag>
                  );
                })}
              </section>

              {/* Répartition */}
              <section className="overflow-hidden rounded-3xl border border-brand-100 bg-white md:flex">
                <div className="flex flex-col justify-center bg-brand-700 p-6 text-white md:w-56 md:shrink-0">
                  <p className="text-sm text-white/70">Comptes actifs</p>
                  <p className="mt-1 font-heading text-5xl font-extrabold">
                    <Num value={totalActive} skeleton="bg-white/20" />
                  </p>
                </div>

                <div className="flex-1 space-y-7 p-6">
                  <div>
                    <h2 className="font-heading text-base font-bold">Patients et médecins</h2>
                    <div className="mt-3">
                      <SplitBar
                        parts={[
                          { label: "Patients", value: stats?.patients ?? 0, color: "bg-[#FFB08E]" },
                          { label: "Médecins", value: stats?.doctors ?? 0, color: "bg-brand-600" },
                        ]}
                      />
                    </div>
                    <Legend
                      items={[
                        { label: "Patients", value: stats?.patients ?? 0, color: "bg-[#FFB08E]" },
                        { label: "Médecins", value: stats?.doctors ?? 0, color: "bg-brand-600" },
                      ]}
                    />
                  </div>

                  <div>
                    <h2 className="font-heading text-base font-bold">Médecins par spécialité</h2>
                    {bySpecialty.cardio + bySpecialty.derma === 0 ? (
                      <p className="mt-3 text-sm text-brand-900/55">Aucun médecin actif pour le moment.</p>
                    ) : (
                      <>
                        <div className="mt-3">
                          <SplitBar
                            parts={[
                              { label: "Cardiologues", value: bySpecialty.cardio, color: "bg-brand-600" },
                              { label: "Dermatologues", value: bySpecialty.derma, color: "bg-coral" },
                            ]}
                          />
                        </div>
                        <Legend
                          items={[
                            { label: "Cardiologues", value: bySpecialty.cardio, color: "bg-brand-600" },
                            { label: "Dermatologues", value: bySpecialty.derma, color: "bg-coral" },
                          ]}
                        />
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Dernières demandes */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold">Dernières demandes</h2>
                  {pending.length > 0 && (
                    <button onClick={() => setTab("pending")} className="text-sm font-semibold text-brand-700 hover:underline">
                      Tout voir ({pending.length})
                    </button>
                  )}
                </div>
                {!loading && pending.length === 0 ? (
                  <Empty icon={Inbox} title="Aucune demande en attente" text="Les nouveaux médecins inscrits apparaîtront ici." />
                ) : (
                  pending.slice(0, 3).map((d) => (
                    <PendingCard key={d.id} d={d} onApprove={(u) => openModal("approve", u)} onReject={(u) => openModal("reject", u)} />
                  ))
                )}
              </section>
            </>
          )}

          {/* ============================ DEMANDES MÉDECINS ============================ */}
          {tab === "pending" && (
            <section className="space-y-3">
              {!loading && pending.length === 0 ? (
                <Empty icon={Inbox} title="Aucune demande en attente" text="Les nouveaux médecins inscrits apparaîtront ici." />
              ) : (
                pending.map((d) => (
                  <PendingCard key={d.id} d={d} onApprove={(u) => openModal("approve", u)} onReject={(u) => openModal("reject", u)} />
                ))
              )}
            </section>
          )}

          {/* ============================ COMPTES ============================ */}
          {tab === "users" && (
            <section className="space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-900/40" />
                <input
                  className="input !pl-11"
                  placeholder="Rechercher par nom ou par email"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Segmented
                  value={filters.role}
                  onChange={(role) => setFilters({ ...filters, role })}
                  options={[["all", "Tous"], ["doctor", "Médecins"], ["patient", "Patients"]]}
                />
                <Segmented
                  value={filters.status}
                  onChange={(status) => setFilters({ ...filters, status })}
                  options={[["all", "Tous statuts"], ["active", "Actifs"], ["banned", "Bannis"], ["rejected", "Refusés"]]}
                />
                <span className="ml-auto text-sm text-brand-900/55">
                  {filtered.length} compte{filtered.length > 1 ? "s" : ""}
                </span>
              </div>

              {filtered.length === 0 && !loading ? (
                <Empty icon={Search} title="Aucun compte trouvé" text="Modifiez la recherche ou les filtres pour élargir les résultats." />
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-brand-100 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-brand-100 text-xs font-semibold text-brand-900/50">
                        <th className="px-5 py-4">Compte</th>
                        <th className="px-5 py-4">Rôle</th>
                        <th className="px-5 py-4">Statut</th>
                        <th className="hidden px-5 py-4 md:table-cell">Inscrit le</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-100">
                      {filtered.map((u) => {
                        const [statusLabel, statusTone, dot] = STATUS[u.status] || [u.status, "bg-gray-100 text-gray-600", "bg-gray-400"];
                        return (
                          <tr key={u.id} className="transition hover:bg-brand-50/50">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar user={u} />
                                <div className="min-w-0">
                                  <p className="font-semibold text-brand-900">{fullName(u)}</p>
                                  <p className="truncate text-xs text-brand-900/55">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-brand-900/80">
                                {u.role === "doctor" ? <Stethoscope size={15} className="text-brand-600" /> : <User size={15} className="text-coral" />}
                                {u.role === "doctor" ? SPECIALTY[u.specialty] ?? "Médecin" : "Patient"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                                {statusLabel}
                              </span>
                            </td>
                            <td className="hidden px-5 py-3.5 text-brand-900/60 md:table-cell">{formatDate(u.createdAt)}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex justify-end gap-1.5">
                                {u.status === "banned" ? (
                                  <button
                                    onClick={() => openModal("unban", u)}
                                    title="Débannir"
                                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                                  >
                                    <RotateCcw size={15} /> Débannir
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openModal("ban", u)}
                                    title="Bannir"
                                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-brand-900/70 transition hover:bg-amber-50 hover:text-amber-700"
                                  >
                                    <Ban size={15} /> Bannir
                                  </button>
                                )}
                                <button
                                  onClick={() => openModal("delete", u)}
                                  title="Supprimer"
                                  aria-label="Supprimer"
                                  className="rounded-xl p-2 text-brand-900/40 transition hover:bg-coral-soft hover:text-coral"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* ------------------------- Fenêtre de confirmation ------------------------- */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm"
          onClick={() => !busy && setModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                cfg.danger ? "bg-coral-soft text-coral" : "bg-brand-100 text-brand-700"
              }`}
            >
              <cfg.icon size={22} />
            </span>
            <h2 className="mt-4 font-heading text-xl font-extrabold">{cfg.title}</h2>
            <p className="mt-1 text-sm text-brand-900/65">{cfg.desc}</p>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
              <Avatar user={modal.user} size="h-10 w-10" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{fullName(modal.user)}</p>
                <p className="truncate text-xs text-brand-900/55">{modal.user.email}</p>
              </div>
            </div>

            {modal.action === "delete" && (
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-coral">
                <AlertTriangle size={16} /> Cette action est irréversible.
              </p>
            )}
            {modal.action === "reject" && (
              <textarea
                className="input mt-4 min-h-[90px]"
                placeholder="Motif du refus (optionnel)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setModal(null)} disabled={busy} className="btn-ghost">
                Annuler
              </button>
              <button
                onClick={runAction}
                disabled={busy}
                className={
                  cfg.danger
                    ? "inline-flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                    : "btn-primary"
                }
              >
                {busy ? "En cours…" : cfg.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------ Notification ------------------------------ */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl ${
            toast.type === "error" ? "bg-coral" : "bg-brand-900"
          }`}
        >
          {toast.type === "error" ? <AlertTriangle size={16} /> : <Check size={16} />}
          {toast.text}
        </div>
      )}
    </div>
  );
}