require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const recipeRoutes = require('./routes/recipeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const userRoutes = require('./routes/userRoutes');
// Inicializar app
const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded
// Rutas

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Añadir métodos necesarios
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ingredients', require('./routes/ingredientRoutes'));

// Ruta de prueba
app.get('/', (req, res) => res.send('API de RecetApp funcionando'));
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de recetas
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

app.use('/api/favorites', favoriteRoutes); 

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));