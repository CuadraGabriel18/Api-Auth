const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authenticateJWT, authorizeRoles } = require('../Middlewares/authMiddleware');
const {
  loginController,
  registerController,
  googleCallbackController,
  googleRegisterCallbackController,
  profileController,
  getAllUsersController,
  deleteUserController,
  getUserByIdController // 👈 nueva función
} = require('../Controller/authController');
const { generateToken } = require('../Utils/jwt');

// 🔐 Autenticación local
router.post('/login', loginController);
router.post('/register', registerController);

// 🔒 Perfil del usuario autenticado (protegido con JWT)
router.get('/profile', authenticateJWT, profileController);

// 🔒 Dashboards protegidos por roles
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

// 🌐 Registro con Google OAuth (usuarios nuevos) — con rol dinámico
router.get('/google/register', (req, res, next) => {
  const role = req.query.role;
  passport.authenticate('google-register', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    state: role // usamos "state" para pasar el rol
  })(req, res, next);
});

// 🔁 Callback de Google OAuth (Registro) con manejo de errores y rol
router.get('/google/register/callback', (req, res, next) => {
  const role = req.query.state;

  passport.authenticate('google-register', { session: false }, async (err, user, info) => {
    if (err || !user) {
      return res.redirect('http://192.168.119.142:5500/login.html?error=Cuenta%20ya%20registrada');
    }

    if (role && (role === 'teacher' || role === 'student')) {
      user.role = role;
      await user.save();
    }

    const token = generateToken(user);
    const { username, email } = user;
    res.redirect(`http://192.168.119.142:5500/login.html?token=${token}&username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(user.role)}`);
  })(req, res, next);
});

// 🆕 Rutas ADMIN: listar y eliminar usuarios
router.get('/users', authenticateJWT, authorizeRoles('admin'), getAllUsersController);
router.delete('/users/:id', authenticateJWT, authorizeRoles('admin'), deleteUserController);

// 🆕 Obtener usuario por ID (para uso de API académica)
router.get('/users/:id', authenticateJWT, getUserByIdController);

module.exports = router;
