const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Giả sử trạng thái ghế đã được chọn được lưu trong đối tượng này
let selectedSeats = {}; // Format: { showtimeId: [seatId, seatId, ...] }

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Khi người dùng mới kết nối, gửi lại trạng thái ghế đã chọn cho họ
  socket.on("get_selected_seats", (showtimeId) => {
    socket.emit("selected_seats", selectedSeats[showtimeId] || []);
  });

  // Khi người dùng chọn ghế
  socket.on("select_seat", ({ seatId, showtimeId }) => {
    if (!selectedSeats[showtimeId]) selectedSeats[showtimeId] = [];
    if (!selectedSeats[showtimeId].includes(seatId)) {
      selectedSeats[showtimeId].push(seatId);
      // Thông báo cho tất cả các client khác về sự thay đổi
      socket.broadcast.emit("seat_selected", { seatId, showtimeId });
    }
  });

  // Khi người dùng bỏ chọn ghế
  socket.on("unselect_seat", ({ seatId, showtimeId }) => {
    if (selectedSeats[showtimeId]) {
      selectedSeats[showtimeId] = selectedSeats[showtimeId].filter(
        (seat) => seat !== seatId
      );
      // Thông báo cho tất cả các client khác về sự thay đổi
      socket.broadcast.emit("seat_unselected", { seatId, showtimeId });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
