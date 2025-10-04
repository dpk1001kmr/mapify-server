const mongoose = require("mongoose");
const { Data } = require("./models/data.model"); // adjust path if needed

const deleteAllDocuments = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://deepak:h7Y6nQ4TmJHBKdq0@nodeexpressprojects.8ub9ywj.mongodb.net/mapify?retryWrites=true&w=majority&appName=NodeExpressProjects"
    );

    const result = await Data.deleteMany({});
    console.log(
      `Deleted ${result.deletedCount} documents from Data collection`
    );
    mongoose.connection.close();
  } catch (error) {
    console.error("Error deleting documents:", error);
    process.exit(1);
  }
};

deleteAllDocuments();
