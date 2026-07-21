const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

// Public or Authenticated voters can view candidates for an election
router.get('/election/:electionId', requireAuth, candidateController.getCandidatesByElection);

// Admin-only endpoints
router.post('/', requireAuth, requireRole('ADMIN'), candidateController.createCandidate);
router.put('/:id', requireAuth, requireRole('ADMIN'), candidateController.updateCandidate);
router.patch('/:id/toggle', requireAuth, requireRole('ADMIN'), candidateController.toggleStatus);
router.delete('/:id', requireAuth, requireRole('ADMIN'), candidateController.deleteCandidate);

module.exports = router;