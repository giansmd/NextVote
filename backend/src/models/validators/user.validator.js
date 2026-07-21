function validateUserImport(req, res, next) {
  const { users } = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: 'La propiedad users debe ser un arreglo no vacío.' });
  }
  next();
}

module.exports = {
  validateUserImport
};