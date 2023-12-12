const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatmessage = require("./utls/messages");
const {
  userleave,
  roomusers,
  userjoin,
  getcurrentuser,
} = require("./utls/users");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
// setting static folder
app.use(express.static(path.join(__dirname, "public")));
//run when client connects
const botname = "chatcord bot";
io.on("connection", (socket) => {
  socket.on("joinroom", ({ username, room }) => {
    const user = userjoin(socket.id, username, room);
    socket.join(user.room);
    //welcome current user
    socket.emit("message", formatmessage(botname, "Welcome to chatcord"));
    //broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatmessage(botname, `${user.username} has joined the chat"`)
      );
    //send user and room info
    io.to(user.room).emit("roomusers", {
      room: user.room,
      users: roomusers(user.room),
    });
  });

  //listen for chat message
  socket.on("chatmessage", (msg) => {
    const user = getcurrentuser(socket.id);
    io.to(user.room).emit("message", formatmessage(user.username, msg));
  });
  //runs when a user disconnects
  socket.on("disconnect", () => {
    const user = userleave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatmessage(botname, `${user.username} has disconnected`)
      );
      //send user and room info
      io.to(user.room).emit("roomusers", {
        room: user.room,
        users: roomusers(user.room),
      });
    }
  });
});
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
