const mongoose = require('mongoose');

const RecipeIngredientSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  ingredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  notes: {
    type: String
  }
}, { versionKey: false });

// Índice compuesto para evitar duplicados
RecipeIngredientSchema.index({ recipe: 1, ingredient: 1 }, { unique: true });

module.exports = mongoose.model('RecipeIngredient', RecipeIngredientSchema);