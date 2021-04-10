const server = require("http").createServer();
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const PORT = 4000;
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const NEW_USER = "newUser";
const SEND_USER_MESSAGE = "sendUserMessage";

let users_list = [];

io.on("connection", (socket) => {
  // Join a conversation
  const { roomId, user } = socket.handshake.query;

  console.log(`Client ${socket.id} - ${user} connected`);
  users_list.push({user, id:socket.id});

  socket.join(roomId);

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  socket.on(SEND_USER_MESSAGE, (data) => {
    // io.emit(NEW_USER, users_list); // responder para todos
    // console.log("lista usuarios: ", users_list);
    let id = users_list.filter((us) =>  us.user == data.body.user)[0].id
    console.log(data.body.msg)
    io.to(id).emit(NEW_CHAT_MESSAGE_EVENT, data.body.msg);

  });

  socket.on(NEW_USER, () => {
    // io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
    io.emit(NEW_USER, users_list); // responder para todos
    console.log("lista usuarios: ", users_list);
  });

  io.emit(NEW_USER, users_list);

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    console.log(`Client ${socket.id}, ${user} diconnected`);
    users_list = users_list.filter((us) => us !== user);
    socket.leave(roomId);
    io.emit(NEW_USER, users_list);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
