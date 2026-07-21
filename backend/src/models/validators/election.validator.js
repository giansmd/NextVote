function validateElectionCreation(req, res, next) {
  const { name, academicPeriod, category, startDate, endDate } = req.body;
  if (!name || !academicPeriod || !category || !startDate || !endDate) {
    return res.status(400).json({ error: 'Faltan campos requeridos para crear la elección.' });
  }
  next();
}

module.exports = {
  validateElectionCreation
};