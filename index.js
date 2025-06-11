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

// ✅ CORS avanzado para frontend
app.use(cors({
  origin: ['http://localhost:5500', 'http://192.168.42.142:5500'], // Reemplaza con tu IP o dominio real si cambia
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

connectDB();

// Rutas
app.use('/auth', authRouter);

// Error global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

// Inicia servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ Auth API corriendo en el puerto y en 0.0.0.0 ' + PORT);
});
