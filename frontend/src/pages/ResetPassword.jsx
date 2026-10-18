import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";

export default function ResetPassword() {
  const { token } = useParams(); // récupéré depuis le lien reçu par email
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = {};
    if (form.password.length < 8) err.password = "8 caractères minimum";
    if (form.confirmPassword !== form.password)
      err.confirmPassword = "Les mots de passe ne correspondent pas";
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setLoading(true);
    // TODO : brancher l'API  POST /api/auth/reset-password/:token  { password }
    console.log("Réinitialisation :", { token, password: form.password });
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 800);
  };

  if (done) {
    return (
      <AuthLayout title="Mot de passe modifié" subtitle="Vous pouvez maintenant vous reconnecter.">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <CheckCircle2 size={28} />
          </span>
          <p className="mt-4 text-sm leading-relaxed text-brand-900/70">
            Votre mot de passe a bien été mis à jour.
          </p>
        </div>
        <Link to="/login" className="btn-primary mt-6 w-full">
          Se connecter <ArrowRight size={16} />
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Nouveau mot de passe" subtitle="Choisissez un mot de passe d'au moins 8 caractères.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <InputField label="Nouveau mot de passe" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="8 caractères min." autoComplete="new-password" />
        <InputField label="Confirmer le mot de passe" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Répéter le mot de passe" autoComplete="new-password" />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
        </button>
      </form>
    </AuthLayout>
  );
}