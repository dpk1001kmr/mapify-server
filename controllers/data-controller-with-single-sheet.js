const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const { asyncHandler } = require("../utils/async-handler");
const { Data } = require("../models/data.model");

const getData = asyncHandler(async (req, res) => {
  const data = await Data.find({});
  res.status(200).json({
    status: "success",
    data: data,
    message: "data fetched successfully",
  });
});

const uploadData = asyncHandler(async (req, res) => {
  // File path
  const filePath = path.join(__dirname, "../uploads/data.xlsx");

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({
      status: "fail",
      message: "File not found after upload",
    });
  }

  // Read the Excel file
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
  });

  // Extract headers from first row
  const headers = sheetData[0];

  // Get collection fields dynamically from Mongoose schema
  const collectionFields = Object.keys(Data.schema.obj);

  // Compare headers with collection fields
  const missingHeaders = []; // fields that exist in the database schema but are missing in the Excel file.
  const extraHeaders = []; // fields that exist in the Excel file but not in the database schema.

  // Find extra headers in the Excel file
  headers.forEach((header) => {
    if (!collectionFields.includes(header)) {
      extraHeaders.push(header);
    }
  });

  // Find missing headers in the Excel file
  collectionFields.forEach((field) => {
    if (!headers.includes(field)) {
      missingHeaders.push(field);
    }
  });

  // Determine match status
  let matchStatus;
  if (missingHeaders.length === 0 && extraHeaders.length === 0) {
    matchStatus = "fully matched";
  } else {
    matchStatus = "partially matched";
  }

  return res.status(200).json({
    status: "success",
    matchStatus,
    fileFields: headers,
    collectionFields,
    missingFileFields: missingHeaders,
    extraFileFields: extraHeaders,
    message: `Headers are ${matchStatus}`,
  });
});

const saveData = asyncHandler(async (req, res) => {
  const filePath = path.join(__dirname, "../uploads/data.xlsx");

  if (!fs.existsSync(filePath)) {
    return res.status(400).json({
      status: "fail",
      message: "Excel file not found in uploads directory",
    });
  }

  // Read Excel file
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON
  let results = xlsx.utils.sheet_to_json(sheet);

  if (!results.length) {
    return res.status(400).json({
      status: "fail",
      message: "Excel file is empty or invalid",
    });
  }

  const partiallyMatchedObject = req.body;

  // Fix partially matched keys
  results = results.map((obj) => {
    const newObj = {};
    for (const key in obj) {
      if (partiallyMatchedObject[key]) {
        newObj[partiallyMatchedObject[key]] = obj[key]; // renamed key
      } else {
        newObj[key] = obj[key]; // keep original key
      }
    }
    return newObj;
  });

  // Insert data to database
  const data = await Data.insertMany(results, { ordered: false });

  return res.status(200).json({
    status: "success",
    data: data,
    message: "Data saved successfully",
  });
});

const dataController = {
  getData,
  uploadData,
  saveData,
};

module.exports = { dataController };
