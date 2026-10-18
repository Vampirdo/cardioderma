const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const ApiError = require("../utils/ApiError");

const uploadDir = path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) return cb(null, true);
  cb(new ApiError(400, "Format non autorisé : PDF, JPG ou PNG uniquement"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;