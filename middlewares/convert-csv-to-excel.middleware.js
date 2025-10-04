const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { asyncHandler } = require("../utils/async-handler");

const convertCsvToExcel = asyncHandler(async (req, res, next) => {
  // Path to CSV in uploads folder
  const csvPath = path.join(__dirname, "../uploads/data.csv");
  if (!fs.existsSync(csvPath)) {
    // return res.status(400).json({
    //   status: "fail",
    //   message: "CSV file not found in uploads directory",
    // });
    next();
  }

  // Read CSV as string
  const csvFile = fs.readFileSync(csvPath, "utf8");

  // Parse CSV into workbook
  const workbook = xlsx.read(csvFile, { type: "string" });

  // Get the first sheet (created automatically from CSV)
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // Create a new workbook and append that sheet
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, worksheet, "Sheet1");

  // Save XLSX in uploads folder
  const excelPath = path.join(__dirname, "../uploads/data.xlsx");
  xlsx.writeFile(newWorkbook, excelPath);

  await fs.promises.unlink(csvPath);
  next();
});

module.exports = { convertCsvToExcel };
