import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  FileText,
  FileUp,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import { authApi } from "../services/authApi";

const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5 Mo

const initialForm = {
  firstName: "",
  lastName: "",
  birthDate: "",
  birthPlace: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  specialty: "",
  licenseNumber: "",
};

export default function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("patient"); // "patient" | "doctor"
  const [form, setForm] = useState(initialForm);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [diploma, setDiploma] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setServerError("");
  };

  // La photo n'est pas encore envoyée : le backend ne la gère pas pour l'instant
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleDiploma = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setErrors((prev) => ({ ...prev, diploma: "Le fichier doit être au format PDF" }));
      return;
    }
    if (file.size > MAX_PDF_SIZE) {
      setErrors((prev) => ({ ...prev, diploma: "Fichier trop lourd (5 Mo maximum)" }));
      return;
    }
    setDiploma(file);
    setErrors((prev) => ({ ...prev, diploma: undefined }));
  };

  const validateStep1 = () => {
    const err = {};
    if (!form.firstName.trim()) err.firstName = "Prénom requis";
    if (!form.lastName.trim()) err.lastName = "Nom requis";
    if (!form.birthDate) err.birthDate = "Date requise";
    if (!form.birthPlace.trim()) err.birthPlace = "Lieu requis";
    if (role === "doctor" && !diploma) err.diploma = "Le PDF de vos diplômes est requis";
    return err;
  };

  const validateStep2 = () => {
    const err = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Email invalide";
    if (!/^(\+216)?\s?\d{2}\s?\d{3}\s?\d{3}$/.test(form.phone.trim()))
      err.phone = "Numéro tunisien invalide (+216 XX XXX XXX)";
    if (form.password.length < 8) err.password = "8 caractères minimum";
    else if (!/[A-Z]/.test(form.password)) err.password = "Au moins une majuscule";
    if (form.confirmPassword !== form.password)
      err.confirmPassword = "Les mots de passe ne correspondent pas";
    if (role === "doctor") {
      if (!form.specialty) err.specialty = "Spécialité requise";
      if (!form.licenseNumber.trim()) err.licenseNumber = "Numéro d'ordre requis";
    }
    if (!accepted) err.accepted = "Vous devez accepter les conditions";
    return err;
  };

  const handleNext = () => {
    const err = validateStep1();
    setErrors(err);
    if (Object.keys(err).length === 0) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) return handleNext();

    const err = validateStep2();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    // Noms de champs attendus par le backend
    const payload = {
      nom: form.lastName.trim(),
      prenom: form.firstName.trim(),
      dateNaissance: form.birthDate,
      lieuNaissance: form.birthPlace.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      telephone: form.phone.replace(/\s/g, ""),
    };

    setLoading(true);
    setServerError("");
    try {
      if (role === "patient") {
        await authApi.registerPatient(payload);
      } else {
        const data = new FormData();
        Object.entries(payload).forEach(([k, v]) => data.append(k, v));
        data.append("specialite", form.specialty);
        data.append("numeroOrdre", form.licenseNumber.trim());
        data.append("justificatifs", diploma);
        await authApi.registerMedecin(data);
      }
      setDone(true);
    } catch (e) {
      setServerError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------- Écran de succès ----------------------------- */
  if (done) {
    return (
      <AuthLayout
        title="Inscription envoyée"
        subtitle={role === "doctor" ? "Vérification en cours" : "Un dernier pas"}
      >
        <div className="flex flex-col items-center rounded-2xl bg-brand-50 p-8 text-center">
          <CheckCircle2 size={44} className="text-brand-600" />
          <p className="mt-4 text-sm text-brand-900/75">
            {role === "doctor"
              ? "Votre demande est en cours de vérification. Vous pourrez vous connecter dès qu'un administrateur aura validé votre compte. Vous recevrez un email avec sa décision."
              : `Un email de confirmation a été envoyé à ${form.email}. Cliquez sur le lien qu'il contient pour activer votre compte.`}
          </p>
        </div>
        <Link to="/login" className="btn-primary mt-6 w-full">
          Aller à la connexion
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Créer votre compte"
      subtitle={`Étape ${step} sur 2 · ${step === 1 ? "Qui êtes-vous ?" : "Vos accès"}`}
    >
      {/* Progression */}
      <div className="mb-8 flex gap-2">
        {[1, 2].map((s) => (
          <span
            key={s}
            className={`h-1.5 flex-1 rounded-full transition ${
              s <= step ? "bg-brand-600" : "bg-brand-100"
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {step === 1 && (
          <>
            {/* Choix du rôle */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ["patient", "Patient", "Suivre ma santé", User],
                ["doctor", "Médecin", "Consulter des patients", Stethoscope],
              ].map(([value, label, hint, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    role === value
                      ? "border-brand-600 bg-brand-50"
                      : "border-brand-100 bg-white hover:border-brand-500/50"
                  }`}
                >
                  <Icon size={22} className={role === value ? "text-brand-600" : "text-brand-900/40"} />
                  <p className="mt-3 text-sm font-bold">{label}</p>
                  <p className="text-xs text-brand-900/55">{hint}</p>
                </button>
              ))}
            </div>

            {/* Photo */}
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-brand-500/40 bg-white p-3 transition hover:bg-brand-50">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-700">
                {photoPreview ? (
                  <img src={photoPreview} alt="Aperçu" className="h-full w-full object-cover" />
                ) : (
                  <Camera size={22} />
                )}
              </span>
              <span>
                <span className="block text-sm font-semibold">Photo de profil</span>
                <span className="block text-xs text-brand-900/55">Optionnel · JPG ou PNG</span>
              </span>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Prénom" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} placeholder="Votre prénom" />
              <InputField label="Nom" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} placeholder="Votre nom" />
              <InputField label="Date de naissance" name="birthDate" type="date" max={new Date().toISOString().split("T")[0]} value={form.birthDate} onChange={handleChange} error={errors.birthDate} />
              <InputField label="Lieu de naissance" name="birthPlace" value={form.birthPlace} onChange={handleChange} error={errors.birthPlace} placeholder="Votre ville" />
            </div>

            {/* Bas du formulaire : diplômes (médecin) collés au bouton "Continuer" */}
            <div className="space-y-3">
              {role === "doctor" && (
                <div className="rounded-2xl bg-brand-50 p-4">
                  <label className="mb-2 block text-sm font-bold">
                    Diplômes (PDF) <span className="text-coral">*</span>
                  </label>

                  {diploma ? (
                    <div className="flex items-center gap-3 rounded-xl border border-brand-500/40 bg-white px-4 py-3">
                      <FileText size={22} className="shrink-0 text-coral" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{diploma.name}</p>
                        <p className="text-xs text-brand-900/50">
                          {(diploma.size / 1024 / 1024).toFixed(2)} Mo
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDiploma(null)}
                        aria-label="Retirer le fichier"
                        className="rounded-full p-1.5 text-brand-900/50 transition hover:bg-coral-soft hover:text-coral"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label
                      className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed bg-white px-4 py-5 text-center transition hover:border-brand-600 ${
                        errors.diploma ? "border-coral" : "border-brand-500/40"
                      }`}
                    >
                      <FileUp size={22} className="text-brand-600" />
                      <span className="text-sm font-semibold">Importer vos diplômes</span>
                      <span className="text-xs text-brand-900/50">PDF uniquement · 5 Mo maximum</span>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={handleDiploma}
                      />
                    </label>
                  )}
                  {errors.diploma && <p className="mt-1.5 text-xs font-medium text-coral">{errors.diploma}</p>}
                  <p className="mt-2 text-xs text-brand-900/50">
                    Votre compte sera activé après vérification par un administrateur.
                  </p>
                </div>
              )}

              <button type="button" onClick={handleNext} className="btn-primary w-full">
                Continuer <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <InputField label="Adresse email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="exemple@email.com" autoComplete="email" />
            <InputField label="Numéro de téléphone" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="+216 XX XXX XXX" />

            {role === "doctor" && (
              <div className="space-y-4 rounded-2xl bg-brand-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  Informations professionnelles
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="specialty" className="mb-1.5 block text-sm font-medium">
                      Spécialité
                    </label>
                    <select
                      id="specialty"
                      name="specialty"
                      value={form.specialty}
                      onChange={handleChange}
                      className={`input ${errors.specialty ? "!border-coral" : ""}`}
                    >
                      <option value="">Choisir…</option>
                      <option value="cardiologue">Cardiologue</option>
                      <option value="dermatologue">Dermatologue</option>
                    </select>
                    {errors.specialty && <p className="mt-1 text-xs font-medium text-coral">{errors.specialty}</p>}
                  </div>
                  <InputField label="Numéro d'ordre" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} error={errors.licenseNumber} placeholder="N° d'inscription" />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Mot de passe" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="8 car. min. + 1 majuscule" autoComplete="new-password" />
              <InputField label="Confirmer" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Répéter" autoComplete="new-password" />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-900/70">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => {
                    setAccepted(e.target.checked);
                    setErrors({ ...errors, accepted: undefined });
                  }}
                  className="mt-0.5 h-4 w-4 accent-brand-700"
                />
                J'accepte les conditions d'utilisation et la politique de confidentialité.
              </label>
              {errors.accepted && <p className="mt-1 text-xs font-medium text-coral">{errors.accepted}</p>}
            </div>

            {serverError && (
              <p className="rounded-xl bg-coral-soft px-4 py-3 text-sm font-medium text-coral">{serverError}</p>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-ghost !px-5" aria-label="Retour">
                <ArrowLeft size={16} />
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? "Création…" : "Créer mon compte"}
              </button>
            </div>
          </>
        )}

        <p className="pt-2 text-center text-sm text-brand-900/60">
          Déjà inscrit ?{" "}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}