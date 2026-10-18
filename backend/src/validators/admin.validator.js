const { param, body } = require("express-validator");

const idRule = param("id").isMongoId().withMessage("Identifiant invalide");

const medecinIdRules = [idRule];

const justificatifRules = [
  idRule,
  param("index")
    .isInt({ min: 0 })
    .withMessage("Index du justificatif invalide"),
];

const refuseRules = [
  idRule,
  body("motif")
    .trim()
    .notEmpty()
    .withMessage("Le motif du refus est obligatoire"),
];

const userIdRules = [idRule];

const banRules = [
  idRule,
  body("motif")
    .trim()
    .notEmpty()
    .withMessage("Le motif du bannissement est obligatoire"),
];

module.exports = {
  medecinIdRules,
  justificatifRules,
  refuseRules,
  userIdRules,
  banRules,
};