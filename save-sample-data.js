const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

// Import the Data model
const Data = require("./models/data.model");

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://deepak:h7Y6nQ4TmJHBKdq0@nodeexpressprojects.8ub9ywj.mongodb.net/mapify?retryWrites=true&w=majority&appName=NodeExpressProjects"
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Read JSON file
const jsonFilePath = "./sample-data.json";
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

// Insert data into the database
async function importData() {
  try {
    await Data.insertMany(jsonData, { ordered: false });
    console.log("✅ Data imported successfully");
  } catch (error) {
    if (error.code === 11000) {
      console.error("⚠ Duplicate email detected while inserting data");
    } else {
      console.error("❌ Error importing data:", error);
    }
  } finally {
    mongoose.connection.close();
  }
}

importData();
