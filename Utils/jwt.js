const jwt = require('jsonwebtoken');

function generateToken(user) {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } 
    );
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
}

module.exports = {
    generateToken,
    verifyToken
};
