import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'; 

// THÊM: tạo HTTP server + socket
import http from 'http';
import { Server } from 'socket.io';
import Message from "./models/messageModel.js";
import Conversation from "./models/conversationModel.js";

import { connectMongoDB } from './config/mongodb.js';
import { connectMySQL } from './config/mysql.js';
import allRoutes from './routes/index.js';
import dbErrorHandler from './middlewares/dbErrorHandler.js';

dotenv.config();

const app = express();

//  Tạo HTTP server từ express (bắt buộc để dùng socket)
const server = http.createServer(app);

// Khởi tạo danh sách origin cho phép (bao gồm preview của Vercel)
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim()) 
  : ['http://localhost:5173'];
const corsOrigin = [...allowedOrigins, /\.vercel\.app$/];

//  Khởi tạo Socket.IO
const io = new Server(server, {
  cors: {
    origin: corsOrigin, 
    credentials: true
  },
  maxHttpBufferSize: 1e7 // Tăng payload socket lên 10MB để gửi ảnh Base64
});

// (OPTIONAL) Export để dùng ở file khác nếu cần
export { io };

app.use(cors({
  origin: corsOrigin, 
  credentials: true // Cho phép gửi/nhận cookie
}));

app.use(express.json());
app.use(cookieParser()); 

const PORT = process.env.PORT || 9999;
app.use('/api', allRoutes);
app.use(dbErrorHandler); // Global error handler — must be after all routes

//  Xử lý kết nối realtime
io.on("connection", (socket) => {
  socket.on("join_room", (room) => {
    socket.join(room);
  });

  socket.on("join_admin_room", () => {
    socket.join("admin_room");
  });

  socket.on("send_message", async (data) => {
    try {
      //  LƯU DB
      const newMsg = await Message.create(data);
      io.to(data.conversationId.toString()).emit("receive_message", newMsg);

      // Nếu người gửi không phải admin, đánh dấu là admin chưa đọc
      if (data.senderId !== "admin") {
        await Conversation.findByIdAndUpdate(data.conversationId, { hasAdminRead: false, updatedAt: new Date() });
        io.to("admin_room").emit("admin_new_message", data.conversationId);
      }
    } catch (err) {
    }
  });

  socket.on("mark_as_read", async (conversationId) => {
    try {
      if (conversationId) {
        await Conversation.findByIdAndUpdate(conversationId, { hasAdminRead: true });
      }
    } catch (err) {
    }
  });

  socket.on("recall_message", async (data) => {
    try {
      const updatedMsg = await Message.findByIdAndUpdate(
        data.messageId, 
        { isRecalled: true, content: "", image: "" },
        { new: true }
      );
      if (updatedMsg) {
        io.to(data.conversationId.toString()).emit("message_recalled", data.messageId);
      }
    } catch (error) {
    }
  });

  socket.on("disconnect", () => {
  });
});


const startServer = async () => {
  try {
    await connectMongoDB();
    await connectMySQL();

    server.listen(PORT, () => {
      console.log(`Server đang chạy tại cổng ${PORT}`);
    });
  } catch (error) {
    console.error("Lỗi khởi động server:", error);
    process.exit(1);
  }
};

startServer();