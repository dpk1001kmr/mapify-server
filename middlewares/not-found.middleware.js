const { CustomError } = require("../utils/custom-error");

const notFound = (req, res, next) => {
  const customError = new CustomError(
    404,
    "fail",
    `route ${req.originalUrl} does not found`
  );
  next(customError);
};

module.exports = { notFound };
