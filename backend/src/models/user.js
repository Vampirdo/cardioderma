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
      minlength: 8,
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

    // Gestion de compte (admin : suspendre / bannir)
    estActif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);