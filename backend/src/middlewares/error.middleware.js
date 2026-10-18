const notFound = (req, res) => {
  res.status(404).json({ success: false, message: "Route introuvable" });
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Erreur serveur";

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