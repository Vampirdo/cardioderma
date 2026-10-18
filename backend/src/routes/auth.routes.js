const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/upload.middleware");
const {
  registerPatientRules,
  registerMedecinRules,
  loginRules,
  resendVerificationRules,
} = require("../validators/auth.validator");

router.post(
  "/register/patient",
  registerPatientRules,
  validate,
  authController.registerPatient
);

// upload d'abord : il lit le formulaire multipart, puis on valide les champs
router.post(
  "/register/medecin",
  upload.array("justificatifs", 3),
  registerMedecinRules,
  validate,
  authController.registerMedecin
);

router.get("/verify-email/:token", authController.verifyEmail);

router.post(
  "/resend-verification",
  resendVerificationRules,
  validate,
  authController.resendVerification
);

router.post("/login", loginRules, validate, authController.login);

module.exports = router;