const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middlewares
app.use(cors());  // Para permitir peticiones desde React
app.use(bodyParser.json());

