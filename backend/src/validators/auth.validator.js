const { body } = require("express-validator");

const registerPatientRules = [
  body("nom").trim().notEmpty().withMessage("Le nom est obligatoire"),
  body("prenom").trim().notEmpty().withMessage("Le prénom est obligatoire"),
  body("email").trim().isEmail().withMessage("Email invalide"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caractères"),
  body("telephone").optional().trim(),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Email invalide"),
  body("password").notEmpty().withMessage("Le mot de passe est obligatoire"),
];

const resendVerificationRules = [
  body("email").trim().isEmail().withMessage("Email invalide"),
];

module.exports = {
  registerPatientRules,
  loginRules,
  resendVerificationRules,
};