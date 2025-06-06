const { registerUser, validateUser, getUserProfile } = require('../Service/authService');
const { generateToken } = require('../Utils/jwt');

const registerController = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const user = await registerUser({ username, email, password, role });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await validateUser(email, password);

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// 🟢 Login con Google (usuarios EXISTENTES)
const googleCallbackController = (req, res) => {
  const token = generateToken(req.user);
  const username = req.user.username;
  const email = req.user.email;

  // Redirigir al frontend con los datos
  res.redirect(`http://127.0.0.1:5500/login.html?token=${token}&username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`);
};

// 🟢 Registro con Google (usuarios NUEVOS)
const googleRegisterCallbackController = (req, res) => {
  const token = generateToken(req.user);
  const username = req.user.username;
  const email = req.user.email;

  // Redirigir al frontend con los datos
  res.redirect(`http://127.0.0.1:5500/login.html?token=${token}&username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`);
};

const profileController = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  registerController,
  loginController,
  profileController,
  googleCallbackController,
  googleRegisterCallbackController
};
