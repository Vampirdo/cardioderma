const jwt = require("jsonwebtoken");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");

// Vérifie le token JWT et charge l'utilisateur dans req.user
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentification requise");
  }

  let decoded;
  try {
    decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Token invalide ou expiré");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.estActif) {
    throw new ApiError(401, "Compte introuvable ou suspendu");
  }

  req.user = user;
  next();
};

module.exports = { protect };