const Recipe = require('../models/Recipe');
const RecipeIngredient = require('../models/RecipeIngredient');

// Crear receta con ingredientes
exports.createRecipe = async (req, res) => {
  try {
    const { ingredients, ...recipeData } = req.body;
    recipeData.author = req.user.id; // Asignar el usuario autenticado

    // Crear la receta
    const recipe = await Recipe.create(recipeData);

    // Asociar ingredientes
    if (ingredients && ingredients.length > 0) {
      const recipeIngredients = ingredients.map(ing => ({
        ...ing,
        recipe: recipe._id
      }));
      await RecipeIngredient.insertMany(recipeIngredients);
    }

    // Obtener la receta con sus ingredientes
    const fullRecipe = await Recipe.findById(recipe._id)
      .populate({
        path: 'ingredients',
        populate: {
          path: 'ingredient',
          model: 'Ingredient'
        }
      });

    res.status(201).json(fullRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener recetas (con filtros)
exports.getRecipes = async (req, res) => {
  try {
    // Para usuarios normales: solo recetas públicas y activas
    let query = Recipe.find().active().public();
    
    // Para el autor: incluye sus recetas privadas
    if (req.user) {
      query = Recipe.find({
        $or: [
          { isActive: true, visibility: 'pública' },
          { author: req.user.id, isActive: true }
        ]
      });
    }
    
    // Para admin: obtiene todas las recetas
    if (req.user?.role === 'admin') {
      query = Recipe.find();
    }

    const recipes = await query
      .populate('author', 'username')
      .populate({
        path: 'ingredients',
        populate: {
          path: 'ingredient',
          model: 'Ingredient'
        }
      })
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Borrado lógico
exports.softDeleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      author: req.user.id // Solo el autor puede "eliminar"
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    recipe.isActive = false;
    await recipe.save();

    res.json({ message: 'Receta desactivada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};