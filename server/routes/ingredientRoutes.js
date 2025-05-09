// routes/ingredientRoutes.js
const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');

// Rutas para ingredientes
router.post('/', ingredientController.createIngredient);
router.get('/', ingredientController.getIngredients);

module.exports = router;