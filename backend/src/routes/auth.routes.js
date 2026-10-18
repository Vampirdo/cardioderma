const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const {
  registerPatientRules,
  loginRules,
  resendVerificationRules,
} = require("../validators/auth.validator");

router.post(
  "/register/patient",
  registerPatientRules,
  validate,
  authController.registerPatient
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