const { CustomError } = require("../utils/custom-error");

const globalErrorHandler = (err, req, res, next) => {
  console.log(err);
  // Handle custom error
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Handle mongoose validation error
  if (err.name === "ValidationError") {
    const errors = {};
    for (let field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    return res.status(400).json({
      status: "fail",
      message: err.message.split(":")[0],
      errors: errors,
    });
  }
  // Default internal server error
  return res.status(500).json({
    status: "error",
    message: err.message || "internal server error",
  });
};

module.exports = { globalErrorHandler };
