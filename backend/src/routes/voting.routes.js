const express = require('express');
const router = express.Router();
const votingController = require('../controllers/voting.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Generate an anonymous credential (token) for the active election
router.get('/:electionId/credential', requireAuth, votingController.getCredential);

// Check if user has already voted / generated credential
router.get('/:electionId/status', requireAuth, votingController.checkStatus);

// Submit a vote using the anonymous token
router.post('/submit', votingController.submitVote);

module.exports = router;