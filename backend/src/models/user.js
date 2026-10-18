const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const notAdmin = function () {
  return this.role !== "admin";
};

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
    },
    prenom: {
      type: String,
      required: [true, "Le prénom est obligatoire"],
      trim: true,
    },
    dateNaissance: {
      type: Date,
      required: [notAdmin, "La date de naissance est obligatoire"],
    },
    lieuNaissance: {
      type: String,
      required: [notAdmin, "Le lieu de naissance est obligatoire"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      select: false,
    },
    telephone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["patient", "medecin", "admin"],
      default: "patient",
    },

    // Champs réservés au médecin
    specialite: { type: String, trim: true },
    numeroOrdre: { type: String, trim: true },
    justificatifs: [{ type: String }],
    statut: {
      type: String,
      enum: ["en_attente", "valide", "refuse"],
      default: "valide",
    },

    // Confirmation d'email (patient uniquement)
    emailVerifie: { type: Boolean, default: true },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    // Réinitialisation du mot de passe
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // Décision de l'admin sur le compte médecin
    motifRefus: { type: String, trim: true },
    dateDecision: { type: Date },
    decidePar: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Bannissement par l'admin
    motifBannissement: { type: String, trim: true },
    dateBannissement: { type: Date },
    banniPar: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // false = compte banni
    estActif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Le mot de passe en clair est vérifié AVANT le hash (patient et médecin)
userSchema.pre("validate", function () {
  if (this.role === "admin") return;
  if (!this.isModified("password")) return;

  const pwd = this.password || "";
  if (pwd.length < 8) {
    this.invalidate(
      "password",
      "Le mot de passe doit contenir au moins 8 caractères"
    );
  } else if (!/[A-Z]/.test(pwd)) {
    this.invalidate(
      "password",
      "Le mot de passe doit contenir au moins une majuscule"
    );
  }
});

// Hash du mot de passe avant sauvegarde
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);