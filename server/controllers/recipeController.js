// controllers/recipeController.js

const Recipe = require('../models/Recipe');
const RecipeIngredient = require('../models/RecipeIngredient');
const Ingredient = require('../models/Ingredient');
const multer = require('multer');
const path = require('path');

// Configuración de Multer
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

// =======================================
// Crear receta
// =======================================
exports.createRecipe = async (req, res) => {
  try {
    console.log("Cuerpo completo recibido:", req.body);

    // 1. Procesar imagen (si existe)
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // 2. Verificar campos requeridos
    const requiredFields = ['name', 'description', 'instructions', 'ingredients', 'difficulty'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        received: req.body
      });
    }

    // 3. Parsear instrucciones e ingredientes
    let parsedInstructions;
    let parsedIngredients;
    try {
      parsedInstructions = typeof req.body.instructions === 'string'
        ? JSON.parse(req.body.instructions)
        : req.body.instructions;

      parsedIngredients = typeof req.body.ingredients === 'string'
        ? JSON.parse(req.body.ingredients)
        : req.body.ingredients;
    } catch (parseError) {
      console.error("Error parseando instrucciones/ingredientes:", parseError);
      return res.status(400).json({
        error: "Formato inválido en instrucciones o ingredientes",
        sample_format: {
          instructions: '["Paso 1", "Paso 2"]',
          ingredients: '[{"ingredient":"<id_ingrediente>","quantity":1,"notes":""}]'
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

    // 5. Crear la receta
    const recipe = await Recipe.create(recipeData);

    // 6. Asociar ingredientes (crear documentos en RecipeIngredient)
    if (Array.isArray(parsedIngredients) && parsedIngredients.length > 0) {
      const recipeIngredients = parsedIngredients.map(ing => ({
        ingredient: ing.ingredient,
        quantity: ing.quantity,
        notes: ing.notes || '',
        recipe: recipe._id
      }));
      await RecipeIngredient.insertMany(recipeIngredients);
    }

    // 7. Responder con la receta poblada
    const fullRecipe = await Recipe.findById(recipe._id)
      .populate({
        path: 'ingredients',
        populate: { path: 'ingredient' }
      })
      .populate('author', 'nombre email');

    res.status(201).json(fullRecipe);

  } catch (error) {
    console.error("Error interno en createRecipe:", {
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

// =======================================
// Obtener recetas activas (con filtros, búsqueda, paginación, etc.)
// =======================================
exports.getAllRecipes = async (req, res) => {
  try {
    const { category, difficulty, time, search } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || '-createdAt';
    const query = {};
    
    // Filtros opcionales
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

    const recipes = await Recipe.find(query)
      .sort(sort)
      .limit(limit)
      .populate({
        path: 'ingredients',
        populate: {
          path: 'ingredient',
          model: 'Ingredient',
          select: 'name unit'
        }
      })
      .populate('author', 'nombre')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    console.error("Error en getRecipes:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================================
// Obtener receta por ID
// =======================================
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
    console.error("Error en getRecipeById:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================================
// Obtener recetas con filtros (para todos los usuarios/admin)
// =======================================
exports.getRecipes = async (req, res) => {
  try {
    const { category, difficulty, time, search } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || '-createdAt';
    const query = {};

    // Solo recetas activas para usuarios normales
    query.isActive = true;
    if (req.user?.role === 'admin') {
      delete query.isActive;
    }

    // Filtros opcionales
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

    const recipes = await Recipe.find(query)
      .sort(sort)
      .limit(limit)
      .populate({
        path: 'ingredients',
        populate: {
          path: 'ingredient',
          model: 'Ingredient',
          select: 'name unit'
        }
      })
      .populate('author', 'nombre')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    console.error("Error en getRecipes:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================================
// Obtener recetas del usuario (activas e inactivas)
// =======================================
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
    console.error("Error en getUserRecipes:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================================
// Actualizar receta
// =======================================
exports.updateRecipe = async (req, res) => {
  try {
    // 1. Verificar que la receta exista y pertenezca al usuario
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      author: req.user.id
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada o no tienes permiso' });
    }

    // 2. Parsear ingredientes (y opcionalmente instrucciones) del body
    let parsedIngredients = [];
    let parsedInstructions = [];
    if (req.body.ingredients) {
      try {
        parsedIngredients = typeof req.body.ingredients === 'string'
          ? JSON.parse(req.body.ingredients)
          : req.body.ingredients;
      } catch (parseError) {
        console.error("Error parseando ingredientes en updateRecipe:", parseError);
        return res.status(400).json({ error: 'Formato inválido en ingredients' });
      }
    }
    if (req.body.instructions) {
      try {
        parsedInstructions = typeof req.body.instructions === 'string'
          ? JSON.parse(req.body.instructions)
          : req.body.instructions;
      } catch (parseError) {
        console.error("Error parseando instrucciones en updateRecipe:", parseError);
        return res.status(400).json({ error: 'Formato inválido en instructions' });
      }
    }

    // 3. Construir objeto 'recipeData' con los campos editables (excepto ingredientes)
    // Extraemos ingredients para no sobrescribir con texto
    const { ingredients, instructions, ...otherFields } = req.body;
    const recipeData = { ...otherFields };

    // Si el usuario sube una nueva imagen (usando multer en la ruta), reemplazamos imageUrl
    if (req.file) {
      recipeData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // 4. Actualizar los campos básicos de la receta
    //    (esto actualiza sólo las propiedades que vienen en recipeData)
    Object.assign(recipe, recipeData);

    // 5. Reemplazar instrucciones si fueron enviadas
    if (parsedInstructions.length > 0) {
      recipe.instructions = parsedInstructions;
    }

    await recipe.save();

    // 6. Si vienen ingredientes, borramos los viejos y guardamos los nuevos
    if (Array.isArray(parsedIngredients)) {
      // Eliminamos asociaciones previas
      await RecipeIngredient.deleteMany({ recipe: recipe._id });

      // Insertamos nuevamente
      if (parsedIngredients.length > 0) {
        const recipeIngredients = parsedIngredients.map(ing => ({
          ingredient: ing.ingredient,
          quantity: ing.quantity,
          notes: ing.notes || '',
          recipe: recipe._id
        }));
        await RecipeIngredient.insertMany(recipeIngredients);
      }
    }

    // 7. Obtener receta actualizada y poblarla para devolverla al frontend
    const updatedRecipe = await Recipe.findById(recipe._id)
      .populate({
        path: 'ingredients',
        populate: { path: 'ingredient' }
      })
      .populate('author', 'nombre email');

    return res.json(updatedRecipe);
  } catch (error) {
    console.error("Error en updateRecipe:", {
      message: error.message,
      stack: error.stack
    });
    return res.status(400).json({ error: error.message });
  }
};

// =======================================
// Cambiar estado de la receta (activar/desactivar)
// =======================================
exports.toggleRecipeStatus = async (req, res) => {
    try {
        // Verificar si el usuario es admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ 
                success: false,
                error: 'No tienes permisos para esta acción' 
            });
        }

        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ 
                success: false,
                error: 'Receta no encontrada' 
            });
        }

        // Opcional: puedes recibir el estado deseado desde el frontend
        const desiredStatus = typeof req.body.currentStatus === 'boolean' 
            ? !req.body.currentStatus 
            : !recipe.isActive;

        recipe.isActive = desiredStatus;
        await recipe.save();

        res.json({
            success: true,
            message: `Receta ${recipe.isActive ? 'activada' : 'desactivada'}`,
            isActive: recipe.isActive
        });
    } catch (error) {
        console.error("Error en toggleRecipeStatus:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// =======================================
// Obtener recetas por ingrediente
// =======================================
exports.searchByIngredient = async (req, res) => {
  try {
    const { ingredient } = req.query;

    if (!ingredient) {
      return res.status(400).json({ error: 'Debes proporcionar un ingrediente' });
    }

    // Buscar el ingrediente por nombre (insensible a mayúsculas)
    const ingredientDoc = await Ingredient.findOne({
      name: { $regex: ingredient, $options: 'i' }
    });

    if (!ingredientDoc) {
      return res.json([]);
    }

    // Buscar recetas que contengan este ingrediente
    const recipes = await Recipe.find({ isActive: true })
      .populate({
        path: 'ingredients',
        match: { ingredient: ingredientDoc._id },
        populate: {
          path: 'ingredient',
          model: 'Ingredient'
        }
      })
      .populate('author', 'nombre')
      .exec();

    // Filtrar recetas que realmente tienen el ingrediente (puede haber algunas con array vacío por el match)
    const filteredRecipes = recipes.filter(recipe =>
      recipe.ingredients && recipe.ingredients.length > 0
    );

    res.json(filteredRecipes);
  } catch (error) {
    console.error("Error en searchByIngredient:", error);
    res.status(500).json({ error: error.message });
  }
};