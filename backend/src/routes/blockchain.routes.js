const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchain.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Public / Authenticated endpoints for auditing blockchain
router.get('/:electionId/blocks', requireAuth, blockchainController.getBlocks);
router.get('/:electionId/verify', requireAuth, blockchainController.verifyChain);
router.get('/:electionId/results', requireAuth, blockchainController.getResults);

module.exports = router;