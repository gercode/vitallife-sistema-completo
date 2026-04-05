/**
 * routes/authRoutes.js
 */
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login',   ctrl.login);
router.post('/logout',  authMiddleware, ctrl.logout);
router.get('/settings',  ctrl.getSettingsPublic);  // Sin autenticación para el landing
router.put('/settings',  authMiddleware, ctrl.updateSettings);

module.exports = router;
