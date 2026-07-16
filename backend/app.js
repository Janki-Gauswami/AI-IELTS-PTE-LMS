const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ===============================
// Middlewares
// ===============================
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// ===============================
// Routes
// ===============================
app.use("/api/v1/auth", authRoutes);

// ===============================
// Health Check Route
// ===============================
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI IELTS & PTE LMS Backend is Running 🚀"
    });
});

module.exports = app;