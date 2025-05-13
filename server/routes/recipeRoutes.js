const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth');
const upload = require('../config/upload');

// Rutas públicas
router.get('/', recipeController.getActiveRecipes);

// Ruta para crear receta (protegida y con upload de imagen)
router.post('/', 
  auth,                      // Primero verifica autenticación
  upload.single('image'),    // Luego procesa la imagen
  recipeController.createRecipe // Finalmente el controlador
);

module.exports = router;