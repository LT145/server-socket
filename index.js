const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // bạn nên thay bằng domain cụ thể nếu là public
    methods: ["GET", "POST"],
  },
});

app.use(cors());

// Dùng một object để lưu trạng thái ghế đã được chọn
let selectedSeats = {};  // { showtimeId: [seatId, seatId, ...] }

// Xử lý kết nối từ client
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // Khi client yêu cầu ghế đã chọn
  socket.on("get_selected_seats", (showtimeId) => {
    // Gửi lại danh sách ghế đã chọn cho showtimeId này
    socket.emit("selected_seats", selectedSeats[showtimeId] || []);
  });

  // Khi client chọn ghế
  socket.on("select_seat", ({ seatId, showtimeId }) => {
    // Lưu ghế đã chọn vào danh sách
    if (!selectedSeats[showtimeId]) selectedSeats[showtimeId] = [];
    if (!selectedSeats[showtimeId].includes(seatId)) {
      selectedSeats[showtimeId].push(seatId);
      // Phát tín hiệu cho tất cả client khác về việc ghế đã được chọn
      socket.broadcast.emit("seat_selected", { seatId, showtimeId });
    }
  });

  // Khi client bỏ chọn ghế
  socket.on("unselect_seat", ({ seatId, showtimeId }) => {
    // Xóa ghế khỏi danh sách chọn
    if (selectedSeats[showtimeId]) {
      selectedSeats[showtimeId] = selectedSeats[showtimeId].filter((seat) => seat !== seatId);
      // Phát tín hiệu cho tất cả client khác về việc ghế đã bị bỏ chọn
      socket.broadcast.emit("seat_unselected", { seatId, showtimeId });
    }
  });

  // Khi client disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
