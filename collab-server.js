const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Excalidraw Collaboration Server running");
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    const room = io.sockets.adapter.rooms.get(roomId);
    const clients = Array.from(room || []);
    io.to(roomId).emit("room-user-change", clients);

    socket.emit("init-room");
    socket.to(roomId).emit("new-user", socket.id);
  });

  socket.on("server-broadcast", (roomId, encryptedBuffer, iv) => {
    socket.to(roomId).emit("client-broadcast", encryptedBuffer, iv);
  });

  socket.on("server-volatile-broadcast", (roomId, encryptedBuffer, iv) => {
    socket.to(roomId).emit("client-broadcast", encryptedBuffer, iv);
  });

  socket.on("server-chat", (roomId, data) => {
    socket.to(roomId).emit("client-chat", data);
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        const room = io.sockets.adapter.rooms.get(roomId);
        const clients = Array.from(room || []).filter(
          (id) => id !== socket.id,
        );
        socket.to(roomId).emit("room-user-change", clients);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Collaboration server listening on port ${PORT}`);
});
