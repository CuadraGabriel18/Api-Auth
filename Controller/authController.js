const { registerUser, validateUser, getUserProfile, getAllUsers, deleteUserById, getUserById } = require('../Service/authService');
const { generateToken } = require('../Utils/jwt');

// 🔹 Registro Local
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

// 🔹 Login Local
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

// 🔹 Login con Google (usuarios EXISTENTES)
const googleCallbackController = (req, res) => {
  const token = generateToken(req.user);
  const { username, email, role } = req.user;

  res.redirect(
    `http://192.168.119.142:5500/login.html?token=${token}&username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`
  );
};

// 🔹 Registro con Google (usuarios NUEVOS)
const googleRegisterCallbackController = (req, res) => {
  const token = generateToken(req.user);
  const { username, email, role } = req.user;

  res.redirect(
    `http://192.168.119.142:5500/login.html?token=${token}&username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`
  );
};

// 🔹 Perfil autenticado
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

// 🔹 Obtener todos los usuarios (solo admin)
const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Eliminar usuario por ID (solo admin)
const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUserById(id);

    res.status(200).json({ message: 'Usuario eliminado', deletedUser });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  registerController,
  loginController,
  profileController,
  googleCallbackController,
  googleRegisterCallbackController,
  getAllUsersController,
  deleteUserController,
  getUserByIdController
};
