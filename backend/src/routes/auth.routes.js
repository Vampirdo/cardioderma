const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/upload.middleware");
const { protect } = require("../middlewares/auth.middleware");
const {
  registerPatientRules,
  registerMedecinRules,
  loginRules,
  resendVerificationRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require("../validators/auth.validator");

// Utilise multer seulement si la requête est un formulaire multipart
const maybeUpload = (req, res, next) =>
  req.is("multipart/form-data")
    ? upload.array("justificatifs", 3)(req, res, next)
    : next();

router.post(
  "/register/patient",
  registerPatientRules,
  validate,
  authController.registerPatient
);

router.post(
  "/register/medecin",
  maybeUpload,
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

router.post(
  "/forgot-password",
  forgotPasswordRules,
  validate,
  authController.forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPasswordRules,
  validate,
  authController.resetPassword
);

router.post("/login", loginRules, validate, authController.login);

// Retourne l'utilisateur connecté (utile pour vérifier qu'un token fonctionne)
router.get("/me", protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;