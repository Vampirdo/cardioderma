const notFound = (req, res) => {
  res.status(404).json({ success: false, message: "Route introuvable" });
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Erreur serveur";

  // Erreurs d'upload (multer)
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Fichier trop volumineux (5 Mo maximum)";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message =
        "Trop de fichiers ou champ incorrect (3 fichiers maximum, champ « justificatifs »)";
    } else {
      message = err.message;
    }
  }

  // Email déjà utilisé (index unique MongoDB)
  if (err.code === 11000) {
    statusCode = 409;
    message = "Cet email est déjà utilisé";
  }

  // Erreur de validation Mongoose
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({ success: false, message });
};

module.exports = { notFound, errorHandler };