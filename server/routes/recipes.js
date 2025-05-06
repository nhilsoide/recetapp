const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth');

// Rutas públicas
router.get('/', recipeController.getRecipes);

// Rutas protegidas
router.use(auth);

router.post('/', recipeController.createRecipe);
router.patch('/:id/visibility', recipeController.changeVisibility);
router.delete('/:id', recipeController.softDeleteRecipe);

// Solo admin
router.get('/admin/all', auth.admin, recipeController.getAllRecipesAdmin);

module.exports = router;