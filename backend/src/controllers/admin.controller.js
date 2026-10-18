const adminService = require("../services/admin.service");

/* ------------------------ Vérification des médecins ---------------------- */

const listMedecins = async (req, res) => {
  const medecins = await adminService.listMedecins(req.query.statut);
  res.json({ success: true, count: medecins.length, medecins });
};

const getMedecin = async (req, res) => {
  const medecin = await adminService.getMedecin(req.params.id);
  res.json({ success: true, medecin });
};

const getJustificatif = async (req, res) => {
  const filePath = await adminService.getJustificatifPath(
    req.params.id,
    Number(req.params.index)
  );
  res.sendFile(filePath);
};

const validerMedecin = async (req, res) => {
  const medecin = await adminService.validerMedecin(req.params.id, req.user);
  res.json({ success: true, message: "Compte médecin validé", medecin });
};

const refuserMedecin = async (req, res) => {
  const medecin = await adminService.refuserMedecin(
    req.params.id,
    req.user,
    req.body.motif
  );
  res.json({ success: true, message: "Compte médecin refusé", medecin });
};

/* ------------------- Gestion des comptes (ban / suppression) ------------- */

const listUsers = async (req, res) => {
  const users = await adminService.listUsers(req.query);
  res.json({ success: true, count: users.length, users });
};

const getUser = async (req, res) => {
  const user = await adminService.getUser(req.params.id);
  res.json({ success: true, user });
};

const banUser = async (req, res) => {
  const user = await adminService.banUser(
    req.params.id,
    req.user,
    req.body.motif
  );
  res.json({ success: true, message: "Compte banni", user });
};

const unbanUser = async (req, res) => {
  const user = await adminService.unbanUser(req.params.id);
  res.json({ success: true, message: "Compte réactivé", user });
};

const deleteUser = async (req, res) => {
  await adminService.deleteUser(req.params.id);
  res.json({ success: true, message: "Compte supprimé définitivement" });
};

module.exports = {
  listMedecins,
  getMedecin,
  getJustificatif,
  validerMedecin,
  refuserMedecin,
  listUsers,
  getUser,
  banUser,
  unbanUser,
  deleteUser,
};