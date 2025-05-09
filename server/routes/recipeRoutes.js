const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth'); // Asegúrate de importar el middleware

// Rutas públicas
router.get('/', recipeController.getActiveRecipes);

// Rutas protegidas (requieren autenticación)
router.post('/', auth, recipeController.createRecipe); // Añade el middleware aquí

module.exports = router;