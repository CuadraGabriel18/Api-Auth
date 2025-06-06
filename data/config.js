const mongoose = require("mongoose");

const connectDB = async () => {
    // Prioridad: Si existe MONGO_URI en las variables de entorno, úsala
    const URL = process.env.MONGO_URI || "mongodb://Gabriel:123@localhost:27017/auth-api?authSource=admin";

    try {
        await mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Could not connect to the database");
        console.error(error);
        process.exit(1);
    }
};

module.exports = { connectDB };
