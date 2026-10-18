const { body } = require("express-validator");

const emailRule = body("email").trim().isEmail().withMessage("Email invalide");

const passwordRule = body("password")
  .isLength({ min: 8 })
  .withMessage("Le mot de passe doit contenir au moins 8 caractères")
  .bail()
  .matches(/[A-Z]/)
  .withMessage("Le mot de passe doit contenir au moins une majuscule");

const identityRules = [
  body("nom").trim().notEmpty().withMessage("Le nom est obligatoire"),
  body("prenom").trim().notEmpty().withMessage("Le prénom est obligatoire"),
  body("dateNaissance")
    .notEmpty()
    .withMessage("La date de naissance est obligatoire")
    .bail()
    .isISO8601({ strict: true })
    .withMessage("Date de naissance invalide (format AAAA-MM-JJ)")
    .bail()
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error("La date de naissance ne peut pas être dans le futur");
      }
      return true;
    }),
  body("lieuNaissance")
    .trim()
    .notEmpty()
    .withMessage("Le lieu de naissance est obligatoire"),
  emailRule,
  passwordRule,
  body("telephone").optional().trim(),
];

const registerPatientRules = [...identityRules];

const registerMedecinRules = [
  ...identityRules,
  body("specialite")
    .trim()
    .notEmpty()
    .withMessage("La spécialité est obligatoire"),
  body("numeroOrdre")
    .trim()
    .notEmpty()
    .withMessage("Le numéro d'ordre est obligatoire"),
];

// Le login ne vérifie PAS la force du mot de passe : seulement qu'il est présent
const loginRules = [
  emailRule,
  body("password").notEmpty().withMessage("Le mot de passe est obligatoire"),
];

const resendVerificationRules = [emailRule];

const forgotPasswordRules = [emailRule];

// Le nouveau mot de passe suit les mêmes règles qu'à l'inscription
const resetPasswordRules = [passwordRule];

module.exports = {
  registerPatientRules,
  registerMedecinRules,
  loginRules,
  resendVerificationRules,
  forgotPasswordRules,
  resetPasswordRules,
};