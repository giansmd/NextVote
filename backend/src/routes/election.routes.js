const express = require('express');
const router = express.Router();
const electionController = require('../controllers/election.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.get('/', requireAuth, electionController.getElections);
router.get('/:id', requireAuth, electionController.getElectionById);

router.post('/', requireAuth, requireRole('ADMIN'), electionController.createElection);
router.put('/:id', requireAuth, requireRole('ADMIN'), electionController.updateElection);
router.post('/:id/start', requireAuth, requireRole('ADMIN'), electionController.startElection);
router.post('/:id/finish', requireAuth, requireRole('ADMIN'), electionController.finishElection);
router.post('/:id/cancel', requireAuth, requireRole('ADMIN'), electionController.cancelElection);

module.exports = router;