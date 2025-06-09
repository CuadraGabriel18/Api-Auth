const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models/authModel');

// ---------------------------------------------
// Local Strategy (email + password)
// ---------------------------------------------
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }

    if (!user.passwordHash) {
      return done(null, false, { message: 'User registered with Google. Use Google login.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user); // Login exitoso
  } catch (err) {
    return done(err);
  }
}));

// ---------------------------------------------
// Google OAuth 2.0 Strategy - LOGIN
// Solo deja pasar si el usuario ya existe
// ---------------------------------------------
passport.use('google-login', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_LOGIN_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Usuario no registrado. Debe registrarse primero.' });
    }
  } catch (err) {
    console.error('Error en Google Login Strategy:', err);
    return done(err);
  }
}));

// ---------------------------------------------
// Google OAuth 2.0 Strategy - REGISTRO
// Solo registra si NO existe, incluye `role`
// ---------------------------------------------
passport.use('google-register', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REGISTER_CALLBACK_URL,
  passReqToCallback: true // 🟢 Esto permite leer `req.query.role`
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      return done(null, false, { message: 'Cuenta ya registrada' });
    }

    const role = req.query.role || 'student'; // 🟢 Por defecto: student

    user = new User({
      username: profile.displayName,
      email: profile.emails[0].value,
      oauthProvider: 'google',
      oauthId: profile.id,
      role
    });

    await user.save();

    return done(null, user);
  } catch (err) {
    console.error('Error en Google Register Strategy:', err);
    return done(err);
  }
}));

// ---------------------------------------------
// Serialización y Deserialización
// ---------------------------------------------
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
