const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState >= 1) {
        return;
    }

    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI environment variable is missing!");
        return;
    }

    try {
        const opts = {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        };
        const connection = await mongoose.connect(process.env.MONGO_URI, opts);
        isConnected = connection.connections[0].readyState;
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;