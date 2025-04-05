const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // hoặc bạn để domain frontend của bạn
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("Socket server is running!");
});

io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.on("select_seat", ({ seatId, showtimeId }) => {
      socket.broadcast.emit("seat_selected", { seatId, showtimeId });
    });

    socket.on("unselect_seat", ({ seatId, showtimeId }) => {
      socket.broadcast.emit("seat_unselected", { seatId, showtimeId });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
