const Recipe = require('../models/Recipe');
const RecipeIngredient = require('../models/RecipeIngredient');
const Ingredient = require('../models/Ingredient');
const multer = require('multer');
const path = require('path');

// Crear receta
exports.createRecipe = async (req, res) => {
  try {
    console.log("Cuerpo completo recibido:", req.body); // Debug

    // 1. Procesar imagen
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // 2. Verificar campos requeridos con mejor manejo de errores
    const requiredFields = ['name', 'description', 'instructions', 'ingredients', 'difficulty'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        received: req.body
      });
    }

    // 3. Parsear datos seguramente
    let parsedInstructions, parsedIngredients;

    try {
      parsedInstructions = typeof req.body.instructions === 'string'
        ? JSON.parse(req.body.instructions)
        : req.body.instructions;

      parsedIngredients = typeof req.body.ingredients === 'string'
        ? JSON.parse(req.body.ingredients)
        : req.body.ingredients;
    } catch (parseError) {
      console.error("Error parseando:", parseError);
      return res.status(400).json({
        error: "Formato inválido en instrucciones o ingredientes",
        sample_format: {
          instructions: '["Paso 1", "Paso 2"]',
          ingredients: '[{"ingredient":"id","quantity":1}]'
        }
      });
    }

    // 4. Construir objeto de receta
    const recipeData = {
      name: req.body.name,
      description: req.body.description,
      instructions: parsedInstructions,
      ingredients: parsedIngredients,
      category: req.body.category || 'otros',
      preparationTime: parseInt(req.body.preparationTime) || 30,
      difficulty: req.body.difficulty || 'media',
      imageUrl,
      author: req.user.id
    };
    console.log("Archivo recibido:", req.file);

    const recipe = await Recipe.create(recipeData);

    // Asociar ingredientes
    if (parsedIngredients.length > 0) {
      const recipeIngredients = parsedIngredients.map(ing => ({
        ingredient: ing.ingredient,
        quantity: ing.quantity,
        notes: ing.notes || '',
        recipe: recipe._id
      }));
      await RecipeIngredient.insertMany(recipeIngredients);
    }

    // Responder con la receta completa
    const fullRecipe = await Recipe.findById(recipe._id)
      .populate({
        path: 'ingredients',
        populate: { path: 'ingredient' }
      })
      .populate('author', 'nombre email');

    res.status(201).json(fullRecipe);

  } catch (error) {
    console.error("Error completo:", {
      message: error.message,
      stack: error.stack,
      receivedBody: req.body,
      receivedFile: req.file
    });
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });
  }
};

// Recetas activas
exports.getActiveRecipes = async (req, res) => {
  try {
    const { category, difficulty, time, search, limit } = req.query;
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

    let queryBuilder = Recipe.find(query)
      .populate('author', 'nombre')
      .populate({
        path: 'ingredients',
        populate: { path: 'ingredient' }
      })
      .sort({ createdAt: -1 });

    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit));
    }

    const recipes = await queryBuilder.exec();

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Configuración de Multer (debes mover esto desde el archivo multer.js o importarlo)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});