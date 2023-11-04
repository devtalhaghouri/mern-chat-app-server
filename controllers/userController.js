const catchAsyncError = require("../middleware/catchAsyncError");
const cloudinary = require("cloudinary");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");

//Register User

exports.register = catchAsyncError(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatar",
    width: 50,
    crop: "scale",
  });

  const { name, email, password } = req.body;

  const existUser = await User.findOne({ email });
  if (existUser) {
    return next(new ErrorHandler("User is already exist ", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Account Created Successfully",
    user,
    token: user.getJWTToken(),
  });
});

//Login User

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email and Password", 500));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invaid Credentials", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invaid Credentials", 400));
  }

  res.status(200).json({
    success: true,
    message: `Login Successfully`,
    user,
    token: user.getJWTToken(),
  });
});

//Get All Users

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

  res.status(200).json({
    users,
  });
});
