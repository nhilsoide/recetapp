// controllers/favoriteController.js
const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');

exports.toggleFavorite = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user.id;

        // Verificar si la receta existe
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ error: 'Receta no encontrada' });
        }

        // Buscar favorito existente
        const existingFavorite = await Favorite.findOne({ user: userId, recipe: recipeId });

        if (existingFavorite) {
            // Eliminar de favoritos
            await Favorite.deleteOne({ _id: existingFavorite._id });
            recipe.favoritesCount -= 1;
            await recipe.save();
            return res.json({ isFavorite: false, favoritesCount: recipe.favoritesCount });
        } else {
            // Añadir a favoritos
            await Favorite.create({ user: userId, recipe: recipeId });
            recipe.favoritesCount += 1;
            await recipe.save();
            return res.json({ isFavorite: true, favoritesCount: recipe.favoritesCount });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id })
            .populate({
                path: 'recipe',
                populate: {
                    path: 'ingredients',
                    populate: {
                        path: 'ingredient'
                    }
                }
            })
            .sort({ createdAt: -1 });

        const favoriteRecipes = favorites.map(fav => fav.recipe);
        res.json(favoriteRecipes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPopularRecipes = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const recipes = await Recipe.find()
            .sort({ favoritesCount: -1 })
            .limit(limit)
            .populate({
                path: 'ingredients',
                populate: {
                    path: 'ingredient'
                }
            });

        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};