require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const connectDB = require("../config/database");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    // Connect Database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      role: "admin",
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists.");
      process.exit();
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // Create Admin
    await User.create({
      name: "System Administrator",
      email: "admin@lms.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("✅ Admin account created successfully.");

    process.exit();

  } catch (error) {

    console.error(error);

    process.exit(1);

  }
};

seedAdmin();