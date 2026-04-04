import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  userId: String,
  email: String,
  hasAdminRead: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);