const express = require('express');
const router = express.Router();
const electionController = require('../controllers/election.controller');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth.middleware');

router.get('/', optionalAuth, electionController.getElections);
router.get('/:id', optionalAuth, electionController.getElectionById);

router.post('/', requireAuth, requireRole('ADMIN'), electionController.createElection);
router.put('/:id', requireAuth, requireRole('ADMIN'), electionController.updateElection);
router.post('/:id/start', requireAuth, requireRole('ADMIN'), electionController.startElection);
router.post('/:id/finish', requireAuth, requireRole('ADMIN'), electionController.finishElection);
router.post('/:id/cancel', requireAuth, requireRole('ADMIN'), electionController.cancelElection);

module.exports = router;