// routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');
const Favorite = require('../models/Favorite');

router.post('/:recipeId', auth, favoriteController.toggleFavorite);
router.get('/user', auth, favoriteController.getUserFavorites);
router.get('/popular', favoriteController.getPopularRecipes);

router.get('/check/:recipeId', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ 
      user: req.user.id, 
      recipe: req.params.recipeId 
    });
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;