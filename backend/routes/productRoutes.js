/**
 * routes/productRoutes.js
 */
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');
const multer  = require('multer');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');

// Configurar Multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product-${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
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
router.post('/',     authMiddleware, upload.single('image'), ctrl.create);
router.put('/:id',  authMiddleware, upload.single('image'), ctrl.update);
router.delete('/:id', authMiddleware, ctrl.remove);

module.exports = router;
