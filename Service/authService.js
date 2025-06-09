const bcrypt = require('bcrypt');
const { User } = require('../models/authModel');

async function registerUser({ username, email, password, role }) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
        username,
        email,
        passwordHash,
        role
    });

    await user.save();
    return user;
}

async function validateUser(email, password) {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found');
    }

    if (!user.passwordHash) {
        throw new Error('User registered with Google. Use Google login.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    return user;
}

async function findOrCreateGoogleUser(profile) {
    let user = await User.findOne({ oauthId: profile.id });

    if (!user) {
        user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            oauthProvider: 'google',
            oauthId: profile.id
        });

        await user.save();
    }

    return user;
}

async function getUserProfile(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    return user;
}

// ✅ Obtener todos los usuarios (sin contraseñas)
async function getAllUsers() {
    return await User.find().select('-passwordHash');
}

// ✅ Eliminar usuario por ID (local o Google)
async function deleteUserById(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        throw new Error('User not found or already deleted');
    }
    return user;
}

module.exports = {
    registerUser,
    validateUser,
    findOrCreateGoogleUser,
    getUserProfile,
    getAllUsers,
    deleteUserById
};
