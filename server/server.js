require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const recipeRoutes = require('./routes/recipes');

// Inicializar app
const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ extended: false }));

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/recipes', recipeRoutes); // ruta de recetas

// Ruta de prueba
app.get('/', (req, res) => res.send('API de RecetApp funcionando'));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));