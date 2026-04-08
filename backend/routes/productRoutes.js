  /**
 * routes/productRoutes.js
 */
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');
const multer  = require('multer');

// Multer en modo memoria (buffer) para subir a Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|webp|gif)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  }
});

// Rutas públicas (para el landing)
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Rutas protegidas (admin)
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'infoSectionImage1', maxCount: 1 },
  { name: 'infoSectionImage2', maxCount: 1 }
]);
router.post('/',     authMiddleware, uploadFields, ctrl.create);
router.put('/:id',  authMiddleware, uploadFields, ctrl.update);
router.delete('/:id', authMiddleware, ctrl.remove);

module.exports = router;
