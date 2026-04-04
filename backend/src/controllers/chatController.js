import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

/**
 *  Tạo conversation
 */
export const createConversation = async (req, res) => {
  try {
    const { userId, email } = req.body;

    //  tìm nếu đã tồn tại
    let conversation = await Conversation.findOne({ userId });

    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        email
      });
    } else if (email && !conversation.email) {
      // Cập nhật lại email cho những box chat cũ chưa có email
      conversation.email = email;
      await conversation.save();
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/**
 *  Lấy tin nhắn
 */
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};

/**
 *  ADMIN: Lấy danh sách conversation
 */
export const getConversation = async (req, res) => {
  try {
    const data = await Conversation.find()
      .sort({ updatedAt: -1 });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getConversations = async (req, res) => {
  try {
    const list = await Conversation.find().sort({ updatedAt: -1 });
    
    // Lọc ra các phòng thực sự có tin nhắn
    const validList = [];
    for (const conv of list) {
      const count = await Message.countDocuments({ conversationId: conv._id });
      if (count > 0) validList.push(conv);
    }

    res.json(validList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};