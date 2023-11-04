const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const user = require("./routes/userRoute");
const chat = require("./routes/chatRoute");
const message = require("./routes/messageRoute");
const errorMiddlewares = require("./middleware/error");

const app = express();

dotenv.config({ path: "./config/config.env" });
app.use(cors());
app.use(express.json());

app.use("/api/user", user);
app.use("/api/chat", chat);
app.use("/api/message", message);
app.use(errorMiddlewares);

module.exports = app;
