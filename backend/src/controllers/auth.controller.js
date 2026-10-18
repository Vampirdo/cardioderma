const authService = require("../services/auth.service");

const registerPatient = async (req, res) => {
  const user = await authService.registerPatient(req.body);
  res.status(201).json({
    success: true,
    message:
      "Compte créé. Un email de confirmation vous a été envoyé : cliquez sur le lien pour activer votre compte.",
    user,
  });
};

const registerMedecin = async (req, res) => {
  const user = await authService.registerMedecin(req.body, req.files);
  res.status(201).json({
    success: true,
    message:
      "Demande d'inscription envoyée. Votre compte sera accessible après validation par l'administrateur.",
    user,
  });
};

const verifyEmail = async (req, res) => {
  const page = (titre, texte) => `
    <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 80px;">
      <h2>${titre}</h2>
      <p>${texte}</p>
    </div>`;

  try {
    await authService.verifyEmail(req.params.token);
    res.send(
      page(
        "Email confirmé ✅",
        "Votre compte est activé. Vous pouvez maintenant vous connecter."
      )
    );
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .send(
        page(
          "Lien invalide ❌",
          "Ce lien est invalide ou a expiré. Demandez un nouvel email de confirmation."
        )
      );
  }
};

const resendVerification = async (req, res) => {
  await authService.resendVerification(req.body.email);
  res.status(200).json({
    success: true,
    message:
      "Si un compte non confirmé existe avec cet email, un nouveau lien vient d'être envoyé.",
  });
};

const login = async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.status(200).json({
    success: true,
    message: "Connexion réussie",
    token,
    user,
  });
};

module.exports = {
  registerPatient,
  registerMedecin,
  verifyEmail,
  resendVerification,
  login,
};