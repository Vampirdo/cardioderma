import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import { authApi } from "../services/authApi";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Email invalide";
    if (!form.password) err.password = "Mot de passe requis";
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      const data = await authApi.login(form.email.trim().toLowerCase(), form.password);
      const token = data.token ?? data.data?.token;
      const user = data.user ?? data.data?.user;
      if (!token || !user) throw new Error("Réponse inattendue du serveur");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (e) {
      setServerError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Bon retour parmi nous" subtitle="Connectez-vous à votre compte">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <InputField
          label="Adresse email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="exemple@email.com"
          autoComplete="email"
        />
        <InputField
          label="Mot de passe"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Votre mot de passe"
          autoComplete="current-password"
        />

        {serverError && (
          <p className="rounded-xl bg-coral-soft px-4 py-3 text-sm font-medium text-coral">{serverError}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Connexion…" : "Se connecter"}
        </button>

        <p className="pt-2 text-center text-sm text-brand-900/60">
          Pas encore de compte ?{" "}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Créer un compte
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}