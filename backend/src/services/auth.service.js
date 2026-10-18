const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Retire les champs sensibles avant d'envoyer l'utilisateur au client
const sanitize = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.__v;
  return obj;
};

// On stocke seulement le hash du token : s'il fuit, il est inutilisable
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const sendVerificationEmail = async (user) => {
  const token = crypto.randomBytes(32).toString("hex");

  user.emailVerificationToken = hashToken(token);
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  await user.save();

  const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
  const link = `${baseUrl}/api/auth/verify-email/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Confirmez votre email - CardioDerma",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Bienvenue sur CardioDerma, ${user.prenom} !</h2>
        <p>Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.</p>
        <p>
          <a href="${link}"
             style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">
            Confirmer mon email
          </a>
        </p>
        <p style="color:#666;font-size:13px;">Ce lien est valable 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
      </div>
    `,
  });
};

const registerPatient = async ({ nom, prenom, email, password, telephone }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Cet email est déjà utilisé");

  // Le rôle est imposé ici : on ne lit JAMAIS le rôle depuis la requête
  const user = await User.create({
    nom,
    prenom,
    email,
    password,
    telephone,
    role: "patient",
    emailVerifie: false,
  });

  try {
    await sendVerificationEmail(user);
  } catch (error) {
    console.error("Erreur envoi email :", error.message);
    await User.deleteOne({ _id: user._id }); // on évite un compte bloqué
    throw new ApiError(
      500,
      "Impossible d'envoyer l'email de confirmation, réessayez plus tard"
    );
  }

  return sanitize(user);
};

const verifyEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: Date.now() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) throw new ApiError(400, "Lien invalide ou expiré");

  user.emailVerifie = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
};

const resendVerification = async (email) => {
  const user = await User.findOne({
    email,
    role: "patient",
    emailVerifie: false,
  });

  // Même réponse que l'email existe ou non (évite de révéler les comptes)
  if (user) {
    try {
      await sendVerificationEmail(user);
    } catch (error) {
      console.error("Erreur envoi email :", error.message);
      throw new ApiError(500, "Impossible d'envoyer l'email, réessayez plus tard");
    }
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Email ou mot de passe incorrect");
  }

  if (!user.estActif) {
    throw new ApiError(403, "Votre compte a été suspendu");
  }

  if (user.role === "patient" && !user.emailVerifie) {
    throw new ApiError(
      403,
      "Veuillez confirmer votre email avant de vous connecter"
    );
  }

  if (user.role === "medecin" && user.statut !== "valide") {
    const message =
      user.statut === "refuse"
        ? "Votre compte médecin a été refusé"
        : "Votre compte médecin est en attente de validation par l'administrateur";
    throw new ApiError(403, message);
  }

  return { user: sanitize(user), token: generateToken(user) };
};

module.exports = { registerPatient, verifyEmail, resendVerification, login };