import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();
import { setServers } from "node:dns/promises";

export const connectMongoDB = async() => {
    setServers(["1.1.1.1", "8.8.8.8"]);
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Kết nối MongoDB thành công");
    } catch (error) {
        console.error(" Lỗi khi kết nối MongoDB:", error.message);

    }
}