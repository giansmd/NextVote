const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchain.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');

// Public / Authenticated endpoints for auditing blockchain
router.get('/:electionId/blocks', optionalAuth, blockchainController.getBlocks);
router.get('/:electionId/verify', optionalAuth, blockchainController.verifyChain);
router.get('/:electionId/results', optionalAuth, blockchainController.getResults);

module.exports = router;