const router = require("express").Router();
const adminController = require("../controllers/admin.controller");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const {
  medecinIdRules,
  justificatifRules,
  refuseRules,
  userIdRules,
  banRules,
} = require("../validators/admin.validator");

// Toutes les routes de ce fichier : connecté ET admin
router.use(protect, authorize("admin"));

/* ------------------------ Vérification des médecins ---------------------- */

router.get("/medecins", adminController.listMedecins);

router.get(
  "/medecins/:id",
  medecinIdRules,
  validate,
  adminController.getMedecin
);

router.get(
  "/medecins/:id/justificatifs/:index",
  justificatifRules,
  validate,
  adminController.getJustificatif
);

router.patch(
  "/medecins/:id/valider",
  medecinIdRules,
  validate,
  adminController.validerMedecin
);

router.patch(
  "/medecins/:id/refuser",
  refuseRules,
  validate,
  adminController.refuserMedecin
);

/* ------------------- Gestion des comptes (ban / suppression) ------------- */

router.get("/users", adminController.listUsers);

router.get("/users/:id", userIdRules, validate, adminController.getUser);

router.patch(
  "/users/:id/bannir",
  banRules,
  validate,
  adminController.banUser
);

router.patch(
  "/users/:id/debannir",
  userIdRules,
  validate,
  adminController.unbanUser
);

router.delete("/users/:id", userIdRules, validate, adminController.deleteUser);

module.exports = router;