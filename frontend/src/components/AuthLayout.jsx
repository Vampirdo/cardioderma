import { Link } from "react-router-dom";
import { ArrowLeft, Check, HeartPulse, ScanFace } from "lucide-react";
import Logo from "./Logo";

const benefits = [
  "Suivi ECG en quasi temps réel",
  "Première analyse de la peau par IA",
  "Médecins vérifiés par nos administrateurs",
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[5fr_6fr]">
      {/* Panneau gauche */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-700/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-coral/20 blur-3xl" />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight">
            Une seule plateforme pour votre{" "}
            <span className="text-coral">cœur</span> et votre{" "}
            <span className="text-honey">peau</span>.
          </h2>
          <ul className="mt-8 space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-white/80">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-brand-100">
                  <Check size={14} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Les deux espaces côte à côte */}
        <div className="relative grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-white/70">
              <HeartPulse size={14} className="text-coral" /> Cardio-Santé
            </div>
            <svg viewBox="0 0 300 80" className="mt-3 w-full" fill="none">
              <path
                className="ecg-line"
                d="M0 40 L50 40 L62 40 L70 22 L80 58 L90 8 L102 72 L112 40 L170 40 L182 40 L190 26 L200 52 L210 14 L222 66 L232 40 L300 40"
                stroke="#FF6B5B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-white/70">
              <ScanFace size={14} className="text-honey" /> Dermatologie
            </div>
            <div className="relative mt-3 flex h-[52px] items-center justify-center overflow-hidden rounded-lg bg-white/10">
              <ScanFace size={26} className="text-white/40" />
              <span className="scan absolute left-0 right-0 h-0.5 bg-honey" />
            </div>
          </div>
        </div>
      </aside>

      {/* Zone formulaire */}
      <main className="flex flex-col bg-sand">
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-900/60 transition hover:text-brand-700"
          >
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
        </div>

        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-md px-6 pb-12">
            <h1 className="text-3xl font-extrabold text-brand-900">{title}</h1>
            <p className="mt-2 text-sm text-brand-900/60">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}