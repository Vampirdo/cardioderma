const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user");

const seedAdmin = async () => {
  const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "Variables manquantes : vérifie MONGO_URI, ADMIN_EMAIL et ADMIN_PASSWORD dans .env"
    );
    process.exit(1);
  }

  if (ADMIN_PASSWORD.length < 8) {
    console.error("ADMIN_PASSWORD doit contenir au moins 8 caractères");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connecté");

    const email = ADMIN_EMAIL.toLowerCase().trim();
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`Un compte existe déjà avec l'email ${email} (rôle : ${existing.role}). Rien à faire.`);
    } else {
      await User.create({
        nom: "Admin",
        prenom: "CardioDerma",
        email,
        password: ADMIN_PASSWORD, // hashé automatiquement par le modèle
        role: "admin",
        statut: "valide",
        emailVerifie: true,
        estActif: true,
      });
      console.log(`Compte admin créé : ${email}`);
    }
  } catch (error) {
    console.error("Erreur seed admin :", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();