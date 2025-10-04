const express = require("express");
const { dataController } = require("../controllers/data.controller");
const { upload } = require("../middlewares/multer.middleware");
const {
  convertCsvToExcel,
} = require("../middlewares/convert-csv-to-excel.middleware");

const dataRouter = express.Router();

dataRouter.get("/", dataController.getData);
dataRouter.post(
  "/upload",
  upload.single("file"),
  convertCsvToExcel,
  dataController.uploadData
);
dataRouter.post("/delete-upload", dataController.deleteUploadedFile);
dataRouter.post("/save", dataController.saveData);

module.exports = { dataRouter };
