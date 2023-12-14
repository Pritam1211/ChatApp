const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user.routes");
const msgRoutes = require("./routes/message.routes");
require("dotenv").config();
const socket = require("socket.io");
const chatRoutes = require("./routes/chat.routes");
const { jwtMiddleware } = require("./middleware/auth.middleware");
const path = require('path');

const app = express();

app.use(cors({
  origin: 'https://chat-app-coral-eta.vercel.app'
}));

app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", jwtMiddleware, msgRoutes);
app.use("/api/chat", jwtMiddleware, chatRoutes);

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("DB connection successful");
}).catch((err) => {
  console.log(err.message);
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started at port ${process.env.PORT}`)
});


const io = socket(server, {
  cors: {
    origin: `http://localhost:3000`,
    credentials: true,
  },
});


io.on("connection", (socket) => {
  socket.on("join-chat", (room) => {
    if (!socket.rooms.has('abc')) {
      socket.join(room);
    } 
  });

  socket.on("new-message", (data) => {
      socket.to(data.chat).emit("message-recieved", data);
  });


});
