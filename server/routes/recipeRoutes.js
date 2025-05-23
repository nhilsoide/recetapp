const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const auth = require('../middleware/auth');
const upload = require('../config/upload');

// Rutas principales
router.get('/', recipeController.getRecipes);

// Ruta de prueba (opcional)
router.get('/mensaje', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Endpoint configurado correctamente' 
  });
});

router.post('/', auth, upload.single('image'), recipeController.createRecipe);

// En tu archivo de rutas (routes/recipeRoutes.js o similar)
router.get('/user', auth, recipeController.getUserRecipes);

// En tu backend (recipeRoutes.js)
router.put('/:id', auth, upload.single('image'), recipeController.updateRecipe);

module.exports = router;