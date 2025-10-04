const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");

const express = require("express");
const mongoose = require("mongoose");

const { dataRouter } = require("./routes/data.route");
const { notFound } = require("./middlewares/not-found.middleware");
const {
  globalErrorHandler,
} = require("./middlewares/global-error-handler.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello, World!" });
});

app.use("/api/v1/data", dataRouter);

app.all("*", notFound);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("CONNECTED TO DATABASE");
  console.log("Server is running on port: ", PORT);
});
