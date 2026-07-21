const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.get('/', requireAuth, requireRole('ADMIN'), auditController.getLogs);

module.exports = router;