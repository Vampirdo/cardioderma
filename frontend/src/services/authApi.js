import { request } from "./apiClient";

export const authApi = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),

  registerPatient: (data) =>
    request("/auth/register/patient", { method: "POST", body: data }),

  // formData : champs + fichier(s) "justificatifs"
  registerMedecin: (formData) =>
    request("/auth/register/medecin", { method: "POST", body: formData }),
};