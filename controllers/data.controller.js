const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const { asyncHandler } = require("../utils/async-handler");
const { Data } = require("../models/data.model");
const { compareRequestBody } = require("../utils/compare-request-body");

const getData = asyncHandler(async (req, res) => {
  const data = await Data.find({});
  res.status(200).json({
    status: "success",
    data: data,
    message: "data fetched successfully",
  });
});

const uploadData = asyncHandler(async (req, res) => {
  const filePath = path.join(__dirname, "../uploads/data.xlsx");

  if (!fs.existsSync(filePath)) {
    return res.status(400).json({
      status: "fail",
      type: "FileNotFoundError",
      message: "File not found after upload",
    });
  }

  const workbook = xlsx.readFile(filePath);
  // Get collection fields dynamically from Mongoose schema
  const collectionFields = Object.keys(Data.schema.obj);

  // Perform header fields validation
  let allSheetsFullyMatched = true;
  let allSheetsResult = [];
  workbook.SheetNames.forEach((sheetName) => {
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
    });
    if (sheetData.length === 0) return; // skip empty sheet
    const headers = sheetData[0];
    // ✅ Header count validation (must be exactly 11)
    if (headers.length !== 11) {
      allSheetsFullyMatched = false;
      allSheetsResult.push({
        sheetName,
        fullyMatched: false,
        fileFields: headers,
        collectionFields,
        missingFileFields: [],
        extraFileFields: [],
        message: `Invalid number of headers in sheet "${sheetName}". Expected 11 but got ${headers.length}.`,
      });
    }
  });

  if (!allSheetsFullyMatched) {
    return res.status(422).json({
      status: "fail",
      type: "FileValidationError",
      allSheetsFullyMatched,
      sheets: allSheetsResult,
      message: `Invalid number of fields`,
    });
  }

  // Perform mapping validation
  allSheetsFullyMatched = true;
  allSheetsResult = [];
  workbook.SheetNames.forEach((sheetName) => {
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
    });
    if (sheetData.length === 0) return; // skip empty sheet
    const headers = sheetData[0];
    // Compare with schema fields
    const missingHeaders = collectionFields.filter(
      (field) => !headers.includes(field)
    );
    const extraHeaders = headers.filter(
      (header) => !collectionFields.includes(header)
    );
    const fullyMatched =
      missingHeaders.length === 0 && extraHeaders.length === 0;
    if (!fullyMatched) allSheetsFullyMatched = false;
    allSheetsResult.push({
      sheetName,
      fullyMatched,
      fileFields: headers,
      collectionFields,
      missingFileFields: missingHeaders,
      extraFileFields: extraHeaders,
      message: `Headers are ${
        fullyMatched ? "fully matched" : "partially matched"
      } in sheet "${sheetName}"`,
    });
  });

  // Save allSheetsResult to a file in the form of requestBody so that validation can be done while saving the data
  if (!allSheetsFullyMatched) {
    const requestBodyFormat = {};
    allSheetsResult.forEach((sheet) => {
      if (!sheet.fullyMatched) {
        requestBodyFormat[sheet.sheetName] = {};
        sheet.extraFileFields.forEach((field) => {
          requestBodyFormat[sheet.sheetName][field] = "";
        });
      }
    });
    const requestBodyFormatFilePath = path.join(
      __dirname,
      "../uploads/request-body-format.json"
    );
    const requestBodyFormatJsonString = JSON.stringify(requestBodyFormat);
    fs.writeFileSync(
      requestBodyFormatFilePath,
      requestBodyFormatJsonString,
      "utf8"
    );
    // console.log(requestBodyFormat);
  } else {
    const requestBodyFormatFilePath = path.join(
      __dirname,
      "../uploads/request-body-format.json"
    );
    const requestBodyFormatJsonString = JSON.stringify({});
    fs.writeFileSync(
      requestBodyFormatFilePath,
      requestBodyFormatJsonString,
      "utf8"
    );
  }

  return res.status(`${allSheetsFullyMatched ? 200 : 422}`).json({
    status: `${allSheetsFullyMatched ? "success" : "fail"}`,
    type: `${
      allSheetsFullyMatched ? "FileMappingSuccess" : "FileMappingError"
    }`,
    allSheetsFullyMatched,
    sheets: allSheetsResult,
    message: `All sheets are ${
      allSheetsFullyMatched ? "fully matched" : "partially matched"
    }`,
  });
});

const deleteUploadedFile = asyncHandler(async (req, res) => {
  const filePath = path.join(process.cwd(), "uploads", "data.xlsx");
  if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
  return res.status(200).json({
    status: "success",
    message: "Uploaded file deleted successfully",
  });
});

const saveData = asyncHandler(async (req, res, next) => {
  // compare requestBody objet with request-body-format.json
  const requestBodyFormatFilePath = path.join(
    __dirname,
    "../uploads/request-body-format.json"
  );
  const requestBodyFormat = JSON.parse(
    fs.readFileSync(requestBodyFormatFilePath, "utf8")
  );
  let requestBodyFormatCompareResult = [];
  if (Object.entries(requestBodyFormat).length !== 0) {
    requestBodyFormatCompareResult = compareRequestBody(
      req.body,
      requestBodyFormat
    );
  }
  if (requestBodyFormatCompareResult.length !== 0) {
    return res.status(422).json({
      status: "fail",
      type: "RequestBodyCompareError",
      sheets: requestBodyFormatCompareResult,
      message: "Mapping is not properly done",
    });
  }

  // Validate duplicate mappings in req.body
  const errors = [];
  Object.entries(req.body).forEach(([sheetName, mappings]) => {
    const mappedValues = Object.values(mappings);
    // Check for duplicates
    const duplicates = mappedValues.filter(
      (val, idx) => mappedValues.indexOf(val) !== idx
    );
    if (duplicates.length > 0) {
      errors.push({
        sheetName,
        message: `Duplicate mappings found in ${sheetName}: ${[
          ...new Set(duplicates),
        ].join(", ")}`,
      });
    }
  });
  if (errors.length !== 0) {
    return res.status(422).json({
      status: "fail",
      type: "DuplicateMappingError",
      sheets: errors,
      message: "Duplicate mappings found",
    });
  }

  // Save the file
  const filePath = path.join(__dirname, "../uploads/data.xlsx");
  if (!fs.existsSync(filePath)) {
    return res.status(400).json({
      status: "fail",
      type: "FileNotFoundError",
      message: "Excel file not found in uploads directory",
    });
  }

  // Read Excel file
  const workbook = xlsx.readFile(filePath);

  let allData = [];

  // req.body contains mappings per sheet
  const mappings = req.body;

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    let results = xlsx.utils.sheet_to_json(sheet);

    if (!results.length) return; // skip empty sheet

    const sheetMapping = mappings[sheetName] || {}; // mapping for current sheet

    // Fix partially matched keys
    results = results.map((obj) => {
      const newObj = {};
      for (const key in obj) {
        if (sheetMapping[key]) {
          newObj[sheetMapping[key]] = obj[key]; // rename column
        } else {
          newObj[key] = obj[key]; // keep original column
        }
      }
      return newObj;
    });

    allData = allData.concat(results);
  });

  if (!allData.length) {
    return res.status(400).json({
      status: "fail",
      type: "NotValidDataError",
      message: "No valid data found in any sheet",
    });
  }

  console.log(allData);

  const operations = allData.map((doc) => ({
    updateOne: {
      filter: { email: doc.email },
      update: { $setOnInsert: doc },
      upsert: true,
    },
  }));

  const allSavedData = await Data.bulkWrite(operations, { ordered: false });

  const insertedIds = Object.values(allSavedData.upsertedIds);

  // Fetch inserted documents
  let insertedDocs = [];
  if (insertedIds.length > 0) {
    insertedDocs = await Data.find({ _id: { $in: insertedIds } });
  }

  // Insert all data into database
  // const data = await Data.insertMany(allData, { ordered: false });

  // delete the uploaded file
  // await fs.promises.unlink(filePath);

  return res.status(200).json({
    status: "success",
    type: "DataSaved",
    count: allData.length,
    insertedCount: allSavedData.upsertedCount,
    skippedCount: allData.length - allSavedData.upsertedCount,
    data: insertedDocs,
    message: "Data from all sheets saved successfully",
  });
});

const dataController = {
  getData,
  uploadData,
  deleteUploadedFile,
  saveData,
};

module.exports = { dataController };
