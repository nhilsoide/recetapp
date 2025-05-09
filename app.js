const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middlewares
app.use(cors());  // Para permitir peticiones desde React
app.use(bodyParser.json());

// Ruta de ejemplo
app.get('/api/mensaje', (req, res) => {
  res.json({ mensaje: 'Hola desde el backend!' });
});

// Iniciar servidor
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });