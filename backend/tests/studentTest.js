const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Enrollment = require("../models/Enrollment");

async function testStudentDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();

    console.log("\n📂 Collections:");
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });

    // Verify models are loaded
    console.log("\n📌 Models Loaded Successfully");
    console.log("✅ User");
    console.log("✅ StudentProfile");
    console.log("✅ Enrollment");

    // Verify indexes
    console.log("\n📌 StudentProfile Indexes:");
    const indexes = await StudentProfile.collection.indexes();
    console.table(indexes);

    console.log("\n🎉 Student Management Database Test Passed!");
  } catch (error) {
    console.error("❌ Database Test Failed");
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 MongoDB Disconnected");
  }
}

testStudentDatabase();