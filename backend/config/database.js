const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        isConnected = connection.connections[0].readyState;
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Failed");
        console.error(error.message);
        throw error;
    }
};

module.exports = connectDB;