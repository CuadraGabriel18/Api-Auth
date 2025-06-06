const mongoose = require("mongoose");

const connectDB = async () => {
    // URL para conexión autenticada con usuario y contraseña
    const URL = "mongodb://Gabriel:123@localhost:27017/auth-api?authSource=admin";

    try {
        await mongoose.connect(URL);
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Could not connect to the database");
        console.error(error);
        process.exit(1); // Mata el proceso si no conecta
    }
};

module.exports = { connectDB };