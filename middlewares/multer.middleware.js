const multer = require("multer");
const path = require("path");

// Multer configuration for uploading Excel file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext === ".xlsx" || ext === ".xls") {
      cb(null, "data.xlsx"); // always overwrite with data.xlsx
    }
    if (ext === ".csv") {
      cb(null, "data.csv"); // always overwrite with data.xlsx
    }
    // cb(null, "data.xlsx"); // always overwrite with data.xlsx
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".xlsx" && ext !== ".xls" && ext !== ".csv") {
      return cb(new Error("Only Excel or CSV files are allowed"));
    }
    cb(null, true);
  },
});

module.exports = {
  upload,
};

// .single("file")
