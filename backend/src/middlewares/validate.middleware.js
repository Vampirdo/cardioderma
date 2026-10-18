const fs = require("fs");
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.files) req.files.forEach((f) => fs.unlink(f.path, () => {}));

    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ champ: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;