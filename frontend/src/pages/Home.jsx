import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bot,
  Check,
  CreditCard,
  HeartPulse,
  Mail,
  MessageSquare,
  ScanFace,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";

const steps = [
  { n: "01", title: "Créez votre compte", text: "Inscrivez-vous en deux étapes, en tant que patient ou médecin." },
  { n: "02", title: "Choisissez votre espace", text: "Cardio-Santé ou Dermatologie : chaque espace a son propre parcours." },
  { n: "03", title: "Suivez et consultez", text: "Consultez vos mesures, obtenez une analyse et échangez avec un médecin." },
];

const features = [
  { icon: MessageSquare, title: "Messagerie en direct", text: "Un fil de discussion privé avec votre médecin." },
  { icon: Video, title: "Consultation en ligne", text: "Rendez-vous et visio sans vous déplacer." },
  { icon: CreditCard, title: "Paiement sécurisé", text: "Consultations et achats réglés en ligne avec Stripe." },
  { icon: ShoppingBag, title: "Boutique soins de la peau", text: "Des produits conseillés par les dermatologues." },
  { icon: Bot, title: "Chatbot santé", text: "Des conseils généraux de premier niveau." },
  { icon: ShieldCheck, title: "Médecins vérifiés", text: "Chaque compte médecin est validé avant son accès." },
];

export default function Home() {
  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold text-brand-800">
            <Sparkles size={14} /> Cardio + Dermato, un seul compte
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-[3.4rem]">
            Gardez un œil sur votre{" "}
            <span className="text-brand-600">cœur</span> et sur votre{" "}
            <span className="text-coral">peau</span>.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-brand-900/65">
            Un capteur ECG connecté pour suivre votre rythme cardiaque, une IA
            pour une première analyse de votre peau, et des médecins à un
            message de distance.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">
              Créer mon compte <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-ghost">
              Se connecter
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-brand-900/70">
            {["Capteur ECG connecté", "Analyse IA en secondes", "Médecins vérifiés"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Check size={12} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Cartes bento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 rounded-3xl bg-brand-900 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                <HeartPulse size={18} className="beat text-coral" /> Fréquence cardiaque
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100">
                En direct
              </span>
            </div>
            <p className="mt-3 font-heading text-5xl font-extrabold">
              72 <span className="text-lg font-semibold text-white/50">bpm</span>
            </p>
            <svg viewBox="0 0 300 80" className="mt-3 w-full" fill="none">
              <path
                className="ecg-line"
                d="M0 40 L50 40 L62 40 L70 22 L80 58 L90 8 L102 72 L112 40 L170 40 L182 40 L190 26 L200 52 L210 14 L222 66 L232 40 L300 40"
                stroke="#FF6B5B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="rounded-3xl bg-coral-soft p-5">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white">
              <ScanFace size={44} className="text-coral" />
              <span className="scan absolute left-0 right-0 h-0.5 bg-coral" />
            </div>
            <p className="mt-4 text-sm font-bold">Analyse de la peau</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full w-1/4 rounded-full bg-brand-600" />
            </div>
            <p className="mt-1.5 text-xs text-brand-900/60">Risque faible</p>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-brand-900/10 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Stethoscope size={16} />
              </span>
              <span className="text-xs font-semibold text-brand-900/60">Votre médecin</span>
            </div>
            <p className="mt-4 rounded-2xl rounded-tl-sm bg-brand-50 p-3 text-sm text-brand-900/80">
              Votre analyse est prête. Je vous écris les prochaines étapes.
            </p>
            <p className="mt-3 text-[11px] text-brand-900/40">Messagerie sécurisée</p>
          </div>
        </div>
      </section>

      {/* ESPACES */}
      <section id="espaces" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="max-w-xl text-3xl font-extrabold sm:text-4xl">
          Deux espaces séparés, un seul compte.
        </h2>
        <p className="mt-3 max-w-lg text-brand-900/60">
          Vos données cardiaques et dermatologiques ne se mélangent jamais.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="rounded-[2rem] bg-brand-900 p-8 text-white md:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral text-white">
              <Activity size={24} />
            </span>
            <h3 className="mt-8 text-2xl font-bold">Cardio-Santé</h3>
            <p className="mt-2 text-white/60">Pour suivre votre cœur au quotidien.</p>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              {["Connexion de votre capteur ECG", "Courbe ECG et fréquence cardiaque", "Niveau de stress estimé", "Historique de vos mesures"].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check size={16} className="text-coral" /> {i}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[2rem] bg-sand-dark p-8 md:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white">
              <ScanFace size={24} />
            </span>
            <h3 className="mt-8 text-2xl font-bold">Dermatologie intelligente</h3>
            <p className="mt-2 text-brand-900/60">Pour comprendre votre peau, simplement.</p>
            <ul className="mt-6 space-y-3 text-sm text-brand-900/80">
              {["Analyse préliminaire d'une photo", "Conseils ou orientation vers un médecin", "Consultation en ligne et messagerie", "Boutique de soins de la peau"].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check size={16} className="text-brand-600" /> {i}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* ÉTAPES */}
      <section id="etapes" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Comment ça marche</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="border-t-2 border-brand-900 pt-5">
                <span className="font-heading text-sm font-bold text-coral">{s.n}</span>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-900/60">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Tout ce qu'il vous faut</h2>
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-brand-900/60">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-700 px-8 py-16 text-center text-white">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/40 blur-2xl" />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">
            Prêt à prendre soin de vous ?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/75">
            Créez votre compte en deux étapes et accédez à vos deux espaces.
          </p>
          <Link
            to="/register"
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-800 transition hover:bg-sand"
          >
            Commencer <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 py-8 md:flex-row">
          <Logo light />
          <p className="flex items-center gap-2 text-sm text-white/60">
            <Mail size={16} /> contact@cardioderma.tn
          </p>
          <p className="text-xs text-white/40">© 2026 CardioDerma · ISITCOM Hammam Sousse</p>
        </div>
      </footer>
    </div>
  );
}