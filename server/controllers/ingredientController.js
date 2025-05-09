// controllers/ingredientController.js
const Ingredient = require('../models/Ingredient');

exports.createIngredient = async (req, res) => {
  try {
    const { name, unit, category } = req.body;
    
    // Validación básica
    if (!name || !unit) {
      return res.status(400).json({ error: 'Nombre y unidad son obligatorios' });
    }

    const ingredient = await Ingredient.create({ name, unit, category });
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Opcional: Para listar ingredientes
exports.getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};