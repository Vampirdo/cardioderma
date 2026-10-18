import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Email invalide";
    if (!form.password) err.password = "Mot de passe requis";
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setLoading(true);
    // TODO : brancher l'API  POST /api/auth/login
    console.log("Connexion :", { ...form, remember });
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <AuthLayout title="Bon retour" subtitle="Connectez-vous pour accéder à vos espaces.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <InputField label="Adresse email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="exemple@email.com" autoComplete="email" />
        <InputField label="Mot de passe" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Votre mot de passe" autoComplete="current-password" />

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-brand-900/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-brand-700"
            />
            Se souvenir de moi
          </label>
          <Link to="/forgot-password" className="font-medium text-brand-700 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Connexion…" : <>Se connecter <ArrowRight size={16} /></>}
        </button>

        <p className="text-center text-sm text-brand-900/60">
          Pas encore de compte ?{" "}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Créer un compte
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}