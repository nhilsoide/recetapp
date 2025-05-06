const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  unit: {
    type: String,
    enum: ['g', 'kg', 'ml', 'l', 'taza', 'cucharada', 'cucharadita', 'unidad'],
    required: true
  },
  category: {
    type: String,
    enum: ['lácteos', 'carnes', 'vegetales', 'frutas', 'granos', 'condimentos', 'otros']
  }
}, { versionKey: false });

module.exports = mongoose.model('Ingredient', IngredientSchema);