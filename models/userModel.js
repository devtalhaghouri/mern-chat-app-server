const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Your Name"],
      maxLength: [25, "Name cannot exceed 25 characters"],
      minLenght: [4, "Name should have more than 4 characters"],
    },

    email: {
      type: String,
      required: [true, "Please Enter Your Email"],
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid Email"],
    },

    password: {
      type: String,
      required: [true, "Please Enter Your Password"],
      maxLength: [25, "Password cannot excceed 25 characters"],
      minLenght: [8, "Password should have more than 8 characters"],
      select: false,
    },

    avatar: {
      public_id: {
        type: String,
        required: true,
      },

      url: {
        type: String,
        required: true,
      },

      createAt: {
        type: Date,
        default: Date.now,
      },
    },
  },

  {
    timestamps: true,
  }
);

//Hash Password

userModel.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

//Comare Password

userModel.methods.comparePassword = async function (enteredPassword) {
  console.log(enteredPassword);

  return await bcrypt.compare(enteredPassword, this.password);
};

userModel.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("User", userModel);
