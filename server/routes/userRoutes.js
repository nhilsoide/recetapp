// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Obtener todos los usuarios (solo admin)
router.get('/', auth, userController.getUsers);

// Cambiar estado de usuario (solo admin)
router.patch('/:id/status', auth, userController.toggleUserStatus);

// Eliminar usuario (solo admin)
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;