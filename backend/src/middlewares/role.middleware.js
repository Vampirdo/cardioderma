const ApiError = require("../utils/ApiError");

// Utilisation : authorize("admin") ou authorize("medecin", "admin")
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "Accès refusé");
    }
    next();
  };

module.exports = { authorize };