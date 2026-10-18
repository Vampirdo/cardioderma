const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } =
    process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      "Config email incomplète : vérifie EMAIL_HOST, EMAIL_USER et EMAIL_PASS dans .env"
    );
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  await transporter.sendMail({
    from: EMAIL_FROM || EMAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;