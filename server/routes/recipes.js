const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth');

// Rutas públicas
router.get('/', recipeController.getActiveRecipes);

// Rutas protegidas
router.use(auth);

router.post('/', recipeController.createRecipe);

module.exports = router;