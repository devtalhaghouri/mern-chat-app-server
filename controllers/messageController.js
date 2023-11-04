const catchAsyncError = require("../middleware/catchAsyncError");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const ErrorHandler = require("../utils/errorHandler");
exports.sendMessage = catchAsyncError(async (req, res, next) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    return next(new ErrorHandler("Invalid", 400));
  }
  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name avatar email ",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    return next(new ErrorHandler(error.message));
  }
});

// ALl Messages

exports.allMessages = catchAsyncError(async (req, res, next) => {
  const message = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name avatar email")
    .populate("chat");

  if (!message) {
    return next(new ErrorHandler("Invalid Id"));
  }

  res.status(200).json(message);
});
