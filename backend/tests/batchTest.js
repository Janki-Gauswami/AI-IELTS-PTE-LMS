const mongoose = require("mongoose");
require("dotenv").config();

const Batch = require("../models/Batch");
const Enrollment = require("../models/Enrollment");

const testDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");

    console.log("\nExisting Collections:");

    const collections = await mongoose.connection.db.listCollections().toArray();

    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });

    console.log("\nBatch Model Loaded Successfully");
    console.log("Enrollment Model Loaded Successfully");

    await mongoose.connection.close();

    console.log("\nDatabase Connection Closed");
  } catch (error) {
    console.error(error);
  }
};

testDatabase();