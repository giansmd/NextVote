const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const electionRoutes = require('./election.routes');
const candidateRoutes = require('./candidate.routes');
const userRoutes = require('./user.routes');
const votingRoutes = require('./voting.routes');
const blockchainRoutes = require('./blockchain.routes');
const auditRoutes = require('./audit.routes');

router.use('/auth', authRoutes);
router.use('/elections', electionRoutes);
router.use('/candidates', candidateRoutes);
router.use('/users', userRoutes);
router.use('/voting', votingRoutes);
router.use('/blockchain', blockchainRoutes);
router.use('/audit', auditRoutes);

module.exports = router;