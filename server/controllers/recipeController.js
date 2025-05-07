const Recipe = require('../models/Recipe');
const RecipeIngredient = require('../models/RecipeIngredient');
const Ingredient = require('../models/Ingredient');

// Crear receta
exports.createRecipe = async (req, res) => {
  try {
    const { ingredients, ...recipeData } = req.body;
    recipeData.author = req.user.id;

    // Validar ingredientes
    if (ingredients && ingredients.length > 0) {
      const ingredientIds = ingredients.map(ing => ing.ingredient);
      const existingIngredients = await Ingredient.find({
        _id: { $in: ingredientIds }
      });

      if (existingIngredients.length !== ingredientIds.length) {
        return res.status(400).json({ error: 'Uno o más ingredientes no existen' });
      }
    }

    const recipe = await Recipe.create(recipeData);

    // Asociar ingredientes si existen
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
        populate: { path: 'ingredient' }
      })
      .populate('author', 'nombre email');

    res.status(201).json(fullRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener receta por ID
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate({
        path: 'ingredients',
        populate: { path: 'ingredient' }
      })
      .populate('author', 'nombre email');

    if (!recipe || !recipe.isActive) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener recetas (con filtros)
exports.getRecipes = async (req, res) => {
  try {
    const { category, difficulty, time, search } = req.query;
    const query = {};
    
    // Filtros básicos
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (time) query.preparationTime = { $lte: parseInt(time) };
    
    // Búsqueda por texto
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Para usuarios normales: solo recetas públicas y activas
    query.isActive = true;
    // query.visibility = 'pública';       
    
    // Para admin: obtiene todas las recetas
    if (req.user?.role === 'admin') {
      delete query.isActive;
      delete query.visibility;
    }

    const recipes = await Recipe.find(query)
      .populate('author', 'nombre')
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

// Obtener todas las recetas activas
exports.getActiveRecipes = async (req, res) => {
  try {
    const { category, difficulty, time, search } = req.query;
    const query = { isActive: true };

    // Filtros
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (time) query.preparationTime = { $lte: parseInt(time) };

    // Búsqueda
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const recipes = await Recipe.find(query)
      .populate('author', 'nombre')
      .populate({
        path: 'ingredients',
        populate: { path: 'ingredient' }
      })
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener recetas del usuario (activas e inactivas)
exports.getUserRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.user.id })
      .populate({
        path: 'ingredients',
        populate: { path: 'ingredient' }
      })
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar receta
exports.updateRecipe = async (req, res) => {
  try {
    const { ingredients, ...recipeData } = req.body;

    // Verificar que la receta exista y pertenezca al usuario
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      author: req.user.id
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada o no tienes permiso' });
    }

    // Actualizar datos básicos
    Object.assign(recipe, recipeData);
    await recipe.save();

    // Actualizar ingredientes si se proporcionan
    if (ingredients) {
      await RecipeIngredient.deleteMany({ recipe: recipe._id });

      if (ingredients.length > 0) {
        const recipeIngredients = ingredients.map(ing => ({
          ...ing,
          recipe: recipe._id
        }));
        await RecipeIngredient.insertMany(recipeIngredients);
      }
    }

    // Obtener receta actualizada
    const updatedRecipe = await Recipe.findById(recipe._id)
      .populate({
        path: 'ingredients',
        populate: { path: 'ingredient' }
      })
      .populate('author', 'nombre email');

    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Cambiar estado de la receta (activo/inactivo)
exports.toggleRecipeStatus = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      author: req.user.id
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    recipe.isActive = !recipe.isActive;
    await recipe.save();

    res.json({
      message: `Receta ${recipe.isActive ? 'activada' : 'desactivada'}`,
      isActive: recipe.isActive
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};