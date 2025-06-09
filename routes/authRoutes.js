const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authenticateJWT, authorizeRoles } = require('../Middlewares/authMiddleware');
const {
  loginController,
  registerController,
  googleCallbackController,
  profileController
} = require('../Controller/authController');
const { generateToken } = require('../Utils/jwt');

// 🔐 Autenticación local
router.post('/login', loginController);
router.post('/register', registerController);

// 🔒 Perfil del usuario autenticado (protegido con JWT)
router.get('/profile', authenticateJWT, profileController);

// 🔒 RUTAS PROTEGIDAS POR ROLES INDIVIDUALES
router.get('/admin/dashboard', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({ message: 'Bienvenido al dashboard de Administradores' });
});

router.get('/teacher/dashboard', authenticateJWT, authorizeRoles('teacher'), (req, res) => {
  res.status(200).json({ message: 'Bienvenido al dashboard de Maestros' });
});

router.get('/student/dashboard', authenticateJWT, authorizeRoles('student'), (req, res) => {
  res.status(200).json({ message: 'Bienvenido al dashboard de Estudiantes' });
});

// 🌐 Login con Google OAuth (usuarios existentes)
router.get('/google', passport.authenticate('google-login', {
  scope: ['profile', 'email']
}));

// 🔁 Callback de Google OAuth (Login)
router.get('/google/callback',
  passport.authenticate('google-login', {
    session: false,
    failureRedirect: '/login.html?error=No+autorizado'
  }),
  (req, res) => {
    const token = generateToken(req.user);
    const { username, email, role } = req.user;
    res.redirect(`http://127.0.0.1:5500/login.html?token=${token}&username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`);
  }
);

// 🌐 Registro con Google OAuth (usuarios nuevos)
router.get('/google/register', passport.authenticate('google-register', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

// 🔁 Callback de Google OAuth (Registro) con manejo de errores
router.get('/google/register/callback', (req, res, next) => {
  passport.authenticate('google-register', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect('http://127.0.0.1:5500/login.html?error=Cuenta%20ya%20registrada');
    }

    const token = generateToken(user);
    const { username, email, role } = user;
    res.redirect(`http://127.0.0.1:5500/login.html?token=${token}&username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`);
  })(req, res, next);
});

module.exports = router;
