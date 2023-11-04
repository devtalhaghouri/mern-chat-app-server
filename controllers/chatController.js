const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

exports.accessChat = catchAsyncError(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new ErrorHandler("UserId params not sent with this request"));
  }

  try {
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name avatar email",
    });

    // Check if isChat array is not empty and the first element has _id property
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      if (fullChat) {
        res.status(200).json(fullChat);
      } else {
        return next(new ErrorHandler("Error creating or retrieving chat", 500));
      }
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

//Fetch Chat

exports.fetchChats = catchAsyncError(async (req, res, next) => {
  Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await User.populate(results, {
        path: "latestMessage.sender",
        select: "name avatar email",
      });
      res.status(200).send(results);
    });
});

//Create Group Chat

exports.createGroupChat = catchAsyncError(async (req, res, next) => {
  const { name, users } = req.body;

  if (!name || !users) {
    return next(new ErrorHandler("Please fill all fields", 400));
  }

  const usersArr = JSON.parse(users);
  if (usersArr.length < 2) {
    return next(
      new ErrorHandler(
        "More than two users are required to from a group chat",
        400
      )
    );
  }

  usersArr.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users: usersArr,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

//Rename Group

exports.renameGroup = catchAsyncError(async (req, res, next) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return next(new ErrorHandler("Chat not found", 400));
  }

  const findId = await Chat.findById(chatId);
  if (!findId) {
    return next(new ErrorHandler("Chat not found", 400));
  }

  const updataChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(updataChat);
});

//Add TO Group
exports.addToGroup = catchAsyncError(async (req, res, next) => {
  const { chatId, userId } = req.body;
  const findId = await Chat.findById(chatId);
  if (!findId) {
    return next(new ErrorHandler("Chat not found", 400));
  }

  const addUser = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!addUser) {
    return next(new ErrorHandler("Chat not found", 400));
  }

  res.status(200).json(addUser);
});

//Remove From Group

exports.removeFromGroup = catchAsyncError(async (req, res, next) => {
  const { chatId, userId } = req.body;
  const findId = await Chat.findById(chatId);
  if (!findId) {
    return next(new ErrorHandler("Chat not found", 400));
  }

  const removeUser = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removeUser) {
    return next(new ErrorHandler("Chat not found", 400));
  }

  res.status(200).json(removeUser);
});
