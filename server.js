const app = require("./app.js");
const connectDB = require("./config/database.js");
const http = require("http");
const cloudinary = require("cloudinary");
const { Server } = require("socket.io");

connectDB();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_KEY_SECRET,
});

const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://127.0.0.1:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData?._id);
    console.log(userData?._id);
    socket.emit("connected");
  });

  socket.on("join_chat", (room) => {
    socket.join(room);
    console.log(`User Joined Room ${room}`);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop_typing", (room) => socket.in(room).emit("stop_typing"));
  socket.on("new_message", (newMessageRecived) => {
    const chat = newMessageRecived?.chat;
    if (!chat?.users) {
      return console.log("chat.user is not found");
    }

    chat?.users?.forEach((user) => {
      if (user?._id == newMessageRecived?.sender?._id) return;

      socket.in(user?._id).emit("message_recieved", newMessageRecived);
    });
  });

  socket.off("setup", () => {
    socket.leave(userData?._id);
  });
});
server.listen(process.env.PORT, () => {
  console.log(`Server is runing is Port: http://localhost:${process.env.PORT}`);
});
