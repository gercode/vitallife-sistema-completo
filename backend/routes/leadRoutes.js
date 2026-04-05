/**
 * routes/leadRoutes.js
 */
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/leadController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', ctrl.create);                                    // Público – formulario landing

// Rutas específicas ANTES que rutas parametrizadas
router.get('/stats',      authMiddleware, ctrl.stats);
router.patch('/:id/read', authMiddleware, ctrl.markRead);
router.get('/:id',        authMiddleware, ctrl.getOne);
router.delete('/:id',     authMiddleware, ctrl.remove);
router.get('/',           authMiddleware, ctrl.getAll);           // Admin

module.exports = router;
