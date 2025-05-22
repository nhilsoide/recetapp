const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  instructions: {
    type: [String],
    required: [true, 'Las instrucciones son requeridas'],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: 'Debe haber al menos una instrucción'
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['postres', 'principales', 'ensaladas', 'bebidas']
  },
  preparationTime: {
    type: Number, // en minutos
    required: [true, 'El tiempo de preparación es requerido'],
    min: [1, 'El tiempo debe ser al menos 1 minuto']
  },
  difficulty: {
    type: String,
    enum: ['fácil', 'media', 'difícil'],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El autor es requerido'],
    immutable: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  favoritesCount: {
    type: Number,
    default: 0
  }
}, {
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware para actualizar la fecha de modificación
RecipeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual para obtener los ingredientes
RecipeSchema.virtual('ingredients', {
  ref: 'RecipeIngredient',
  localField: '_id',
  foreignField: 'recipe',
  justOne: false
});

// Query helper para recetas activas
RecipeSchema.query.active = function () {
  return this.where({ isActive: true });
};

module.exports = mongoose.model('Recipe', RecipeSchema);