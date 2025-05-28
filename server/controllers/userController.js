// controllers/userController.js
const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    // Solo admin puede ver todos los usuarios
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const users = await User.find().select('');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    // Solo admin puede cambiar estados
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'}`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Solo admin puede eliminar usuarios
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};