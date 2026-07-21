function validateVoteSubmission(req, res, next) {
  const { electionId, token, candidateId } = req.body;
  if (!electionId || typeof electionId !== 'string') {
    return res.status(400).json({ error: 'El parámetro electionId es requerido.' });
  }
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'El parámetro token es requerido.' });
  }
  if (!candidateId || typeof candidateId !== 'string') {
    return res.status(400).json({ error: 'El candidato seleccionado es inválido.' });
  }
  next();
}

module.exports = {
  validateVoteSubmission
};