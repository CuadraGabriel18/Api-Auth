const express = require('express');
const cors = require('cors');
require('dotenv').config();
const passport = require('passport');
const { connectDB } = require('./data/config');
require('./data/passport'); 
const authRouter = require('./routes/authRoutes');

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

console.log('🧪 JWT_SECRET usado en auth:', JWT_SECRET);

if (!JWT_SECRET || !MONGO_URI) {
    console.error('❌ Error: Variables de entorno faltantes en .env (JWT_SECRET o MONGO_URI)');
    process.exit(1);
}

const app = express();

// ✅ CORS para permitir cualquier IP local tipo http://192.168.x.x
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://192.168.42.142')) {
      callback(null, true); // permitir
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());
app.use(passport.initialize());

// Conectar a la base de datos
connectDB();

// Prefijo para todas las rutas de autenticación
app.use('/auth', authRouter);

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ Auth API corriendo en 0.0.0.0:' + PORT);
});
