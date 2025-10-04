const asyncHandler = (callback) => {
  // The returned function will be called by express when a route is matched
  return async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  asyncHandler,
};
