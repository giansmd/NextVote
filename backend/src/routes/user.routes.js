const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.post('/import', requireAuth, requireRole('ADMIN'), userController.importUsers);
router.get('/', requireAuth, requireRole('ADMIN'), userController.getUsers);
router.patch('/:id/toggle', requireAuth, requireRole('ADMIN'), userController.toggleUserStatus);

module.exports = router;