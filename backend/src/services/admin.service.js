const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");

const uploadDir = path.join(__dirname, "../../uploads");
const STATUTS = ["en_attente", "valide", "refuse"];
const ROLES_GERABLES = ["patient", "medecin"]; // l'admin n'est jamais concerné

/* ------------------------ Vérification des médecins ---------------------- */

const listMedecins = async (statut) => {
  const filter = { role: "medecin" };

  if (statut !== undefined && String(statut).trim() !== "") {
    const valeur = String(statut).trim().toLowerCase();
    if (!STATUTS.includes(valeur)) {
      throw new ApiError(
        400,
        `Statut invalide : « ${valeur} ». Valeurs possibles : ${STATUTS.join(", ")}`
      );
    }
    filter.statut = valeur;
  }

  return User.find(filter).sort({ createdAt: -1 });
};

const findMedecin = async (id) => {
  const medecin = await User.findOne({ _id: id, role: "medecin" });
  if (!medecin) throw new ApiError(404, "Médecin introuvable");
  return medecin;
};

const getMedecin = (id) => findMedecin(id);

// Retourne le chemin absolu d'un justificatif, de façon sécurisée
const getJustificatifPath = async (id, index) => {
  const medecin = await findMedecin(id);
  const fichier = medecin.justificatifs[index];
  if (!fichier) throw new ApiError(404, "Justificatif introuvable");

  // basename : empêche toute sortie du dossier uploads
  const absolutePath = path.join(uploadDir, path.basename(fichier));
  if (!fs.existsSync(absolutePath)) {
    throw new ApiError(
      404,
      "Fichier absent du serveur (inscription faite en mode test JSON ?)"
    );
  }
  return absolutePath;
};

const notifyMedecin = async (medecin, statut, motif) => {
  const valide = statut === "valide";
  try {
    await sendEmail({
      to: medecin.email,
      subject: valide
        ? "Votre compte médecin est validé - CardioDerma"
        : "Votre demande d'inscription - CardioDerma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2>Bonjour Dr ${medecin.nom},</h2>
          ${
            valide
              ? "<p>Vos justificatifs ont été vérifiés : votre compte est <b>validé</b>. Vous pouvez maintenant vous connecter.</p>"
              : `<p>Après vérification, votre demande n'a pas pu être acceptée.</p><p><b>Motif :</b> ${motif}</p>`
          }
        </div>
      `,
    });
  } catch (error) {
    // La décision est déjà enregistrée : un échec d'email ne doit pas l'annuler
    console.error("Erreur envoi email :", error);
  }
};

const decide = async (id, admin, statut, motif) => {
  const medecin = await findMedecin(id);

  if (medecin.statut === statut) {
    throw new ApiError(400, `Ce compte est déjà ${statut}`);
  }

  medecin.statut = statut;
  medecin.motifRefus = statut === "refuse" ? motif : undefined;
  medecin.dateDecision = new Date();
  medecin.decidePar = admin._id;
  await medecin.save();

  await notifyMedecin(medecin, statut, motif);
  return medecin;
};

const validerMedecin = (id, admin) => decide(id, admin, "valide");
const refuserMedecin = (id, admin, motif) =>
  decide(id, admin, "refuse", motif);

/* ------------------- Gestion des comptes (ban / suppression) ------------- */

// Cherche un patient ou médecin. Un admin n'est jamais retourné : intouchable.
const findManagedUser = async (id) => {
  const user = await User.findOne({
    _id: id,
    role: { $in: ROLES_GERABLES },
  });
  if (!user) throw new ApiError(404, "Utilisateur introuvable");
  return user;
};

const listUsers = async ({ role, estActif, search } = {}) => {
  const filter = { role: { $in: ROLES_GERABLES } };

  if (role !== undefined && String(role).trim() !== "") {
    const valeur = String(role).trim().toLowerCase();
    if (!ROLES_GERABLES.includes(valeur)) {
      throw new ApiError(
        400,
        `Rôle invalide : « ${valeur} ». Valeurs possibles : ${ROLES_GERABLES.join(", ")}`
      );
    }
    filter.role = valeur;
  }

  if (estActif !== undefined && String(estActif).trim() !== "") {
    const valeur = String(estActif).trim().toLowerCase();
    if (!["true", "false"].includes(valeur)) {
      throw new ApiError(400, "estActif doit valoir true ou false");
    }
    filter.estActif = valeur === "true";
  }

  if (search !== undefined && String(search).trim() !== "") {
    // On échappe les caractères spéciaux pour éviter les regex malveillantes
    const safe = String(search)
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safe, "i");
    filter.$or = [{ nom: regex }, { prenom: regex }, { email: regex }];
  }

  return User.find(filter).sort({ createdAt: -1 });
};

const getUser = (id) => findManagedUser(id);

const notifyBan = async (user, banni, motif) => {
  try {
    await sendEmail({
      to: user.email,
      subject: banni
        ? "Votre compte a été banni - CardioDerma"
        : "Votre compte est réactivé - CardioDerma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2>Bonjour ${user.prenom},</h2>
          ${
            banni
              ? `<p>Votre compte CardioDerma a été <b>banni</b> par un administrateur.</p><p><b>Motif :</b> ${motif}</p>`
              : "<p>Votre compte CardioDerma a été <b>réactivé</b>. Vous pouvez de nouveau vous connecter.</p>"
          }
        </div>
      `,
    });
  } catch (error) {
    // La décision est déjà enregistrée : un échec d'email ne l'annule pas
    console.error("Erreur envoi email :", error);
  }
};

const banUser = async (id, admin, motif) => {
  const user = await findManagedUser(id);
  if (!user.estActif) throw new ApiError(400, "Ce compte est déjà banni");

  // findByIdAndUpdate : pas de revalidation complète du document
  const updated = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        estActif: false,
        motifBannissement: motif,
        dateBannissement: new Date(),
        banniPar: admin._id,
      },
    },
    { new: true }
  );

  await notifyBan(updated, true, motif);
  return updated;
};

const unbanUser = async (id) => {
  const user = await findManagedUser(id);
  if (user.estActif) throw new ApiError(400, "Ce compte n'est pas banni");

  const updated = await User.findByIdAndUpdate(
    id,
    {
      $set: { estActif: true },
      $unset: { motifBannissement: "", dateBannissement: "", banniPar: "" },
    },
    { new: true }
  );

  await notifyBan(updated, false);
  return updated;
};

const deleteUser = async (id) => {
  const user = await findManagedUser(id);

  // Supprime les justificatifs du médecin sur le disque
  (user.justificatifs || []).forEach((fichier) => {
    const absolutePath = path.join(uploadDir, path.basename(fichier));
    fs.unlink(absolutePath, () => {}); // ignore si le fichier n'existe pas
  });

  await User.deleteOne({ _id: user._id });
};

module.exports = {
  listMedecins,
  getMedecin,
  getJustificatifPath,
  validerMedecin,
  refuserMedecin,
  listUsers,
  getUser,
  banUser,
  unbanUser,
  deleteUser,
};