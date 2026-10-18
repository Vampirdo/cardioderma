import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Email invalide");
      return;
    }
    setError("");
    setLoading(true);

    // TODO : brancher l'API  POST /api/auth/forgot-password  { email }
    // Le backend envoie un email contenant un lien : /reset-password/<token>
    console.log("Mot de passe oublié :", email);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  if (sent) {
    return (
      <AuthLayout title="Vérifiez votre boîte mail" subtitle="Le lien de réinitialisation est en route.">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <MailCheck size={26} />
          </span>
          <p className="mt-4 text-sm leading-relaxed text-brand-900/70">
            Si un compte existe pour <b className="text-brand-900">{email}</b>, un email
            contenant un lien de réinitialisation vient d'être envoyé. Ce lien est
            valable 1 heure.
          </p>
          <p className="mt-3 text-xs text-brand-900/50">
            Pensez à vérifier vos courriers indésirables.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={() => setSent(false)} className="btn-ghost w-full">
            Utiliser une autre adresse
          </button>
          <Link to="/login" className="btn-primary w-full">
            Retour à la connexion
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Mot de passe oublié ?"
      subtitle="Entrez votre email, nous vous envoyons un lien pour en choisir un nouveau."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <InputField
          label="Adresse email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={error}
          placeholder="exemple@email.com"
          autoComplete="email"
        />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Envoi…" : <>Envoyer le lien <ArrowRight size={16} /></>}
        </button>

        <p className="text-center text-sm">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline"
          >
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}