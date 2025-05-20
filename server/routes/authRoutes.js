const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
// @route   POST /api/auth/register
// @desc    Registrar usuario
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    user = new User({
      nombre,
      email,
      password
    });

    await user.save();

    // Crear y devolver el token JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// @route   POST /api/auth/login
// @desc    Autenticar usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }
    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no existe' });
    }
    //Comparar 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    // si es admin 
    const isAdmin = email === 'nhilse5@gmail.com';
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        isAdmin: isAdmin
      }
    };
    //token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallbackSecret',
      { expiresIn: '5d' }
    );


    // respuesta
    res.json({
      success: true, message: 'Login exitoso', token, isAdmin,
      user: {
        id: user._id, email: user.email, nombre: user.nombre
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false, message: 'Error en el servidor', error: error.message
    });
  }
});

// @route   GET /api/auth/user
// @desc    Obtener datos del usuario autenticado
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// routes/authRoutes.js
//SOLO PAARAAA PRUEBAAAAAAS no jalo pipipi
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // En desarrollo: devolver la contraseña (solo para testing)
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        msg: 'Contraseña recuperada',
        password: user.password // En producción NUNCA hagas esto
      });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT /api/auth/profile
// @desc    Actualizar perfil de usuario
router.put('/profile', auth, async (req, res) => {
  const { nombre, email } = req.body;

  try {
    // Verificar si el nuevo email ya existe (si se está cambiando)
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: 'El email ya está en uso' });
      }
    }

    // Actualizar usuario
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        nombre: nombre || req.user.nombre,
        email: email || req.user.email
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Generar nuevo token si el email cambió
    if (email && email !== req.user.email) {
      const payload = {
        user: {
          id: user.id,
          email: user.email,
          isAdmin: req.user.isAdmin
        }
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5d' }
      );

      return res.json({
        user,
        token,
        msg: 'Perfil actualizado. Tu sesión ha sido renovada.'
      });
    }

    res.json({
      user,
      msg: 'Perfil actualizado correctamente'
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;