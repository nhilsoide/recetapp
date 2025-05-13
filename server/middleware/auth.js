const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Busca el token en múltiples ubicaciones posibles
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.header('x-auth-token') ||
                req.cookies?.token;

  // 2. Debug (opcional)
  console.log('Token encontrado:', token);

  if (!token) {
    return res.status(401).json({ 
      error: "Acceso denegado",
      details: "El token no fue proporcionado en los headers (Authorization: Bearer token)"
    });
  }

  try {
    // 3. Verifica el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Asegúrate que el token tenga la estructura correcta
    if (!decoded.user?.id) {
      throw new Error("Estructura de token inválida");
    }
    
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    res.status(401).json({ 
      error: "Token inválido",
      details: error.message 
    });
  }
};