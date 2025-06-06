const jwt = require('jsonwebtoken');

// Middleware para verificar JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // Aquí guardamos el payload del token en req.user
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};

// Middleware para autorización por roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'No tienes permiso para acceder a este recurso' });
        }

        next();
    };
};

module.exports = { authenticateJWT, authorizeRoles };