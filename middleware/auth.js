const jwt = require("jsonwebtoken");
const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/userModel");
exports.isAuthentication = catchAsyncError(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return next(
      new ErrorHandler("Please Login to access these resources ", 401)
    );
  }

  const token = authorizationHeader.replace("Bearer ", "");

  if (!token) {
    return next(
      new ErrorHandler("Please Login to access these resources ", 401)
    );
  }


  try {
    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodeData.id);
    next();
  } catch (error) {
    console.log(error.stack);
    return next(new ErrorHandler("Invalid token. Please log in again.", 401));
  }
});
