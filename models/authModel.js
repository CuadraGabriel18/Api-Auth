const mongoose = require('mongoose');

// Definición del esquema de usuario
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  passwordHash: { 
    type: String // Solo existe si es registro local
  },
  role: { 
    type: String, 
    enum: ['student', 'teacher', 'admin'], 
    default: 'student' 
  },
  oauthProvider: { 
    type: String, 
    enum: ['google', null], 
    default: null 
  },
  oauthId: { 
    type: String, 
    default: null // ID que da Google OAuth
  }
}, { 
  timestamps: true // createdAt y updatedAt automáticos
});

// Middleware para validar password si no es OAuth
userSchema.pre('save', function(next) {
  if (!this.oauthProvider && !this.passwordHash) {
    return next(new Error('Password is required for local users.'));
  }
  next();
});

// Exportar el modelo
const User = mongoose.model('User', userSchema);

module.exports = { User };
