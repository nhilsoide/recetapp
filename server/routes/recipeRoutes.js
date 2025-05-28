const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth');
const upload = require('../config/upload');

// Recetas
router.get('/', recipeController.getRecipes);
router.get('/all', recipeController.getAllRecipes);

// Test
router.get('/mensaje', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Endpoint configurado correctamente' 
  });
});

// Crear receta
router.post('/', auth, upload.single('image'), recipeController.createRecipe);

// Recetas por usuario
router.get('/user', auth, recipeController.getUserRecipes);

// Modificar receta
router.put('/:id', auth, upload.single('image'), recipeController.updateRecipe);

//Obtener recetas por ingredientes
router.get('/search/ingredient', recipeController.searchByIngredient);

// Cambiar estado de receta (solo admin yo jijiji)
router.patch('/:id/status', auth, recipeController.toggleRecipeStatus);

module.exports = router;