import express from "express";
import { createConversation, getMessages ,getConversation,getConversations} from "../controllers/chatController.js";

const router = express.Router();

router.post("/conversation", createConversation);
router.get("/messages/:id", getMessages);
router.get("/conversations", getConversation);
router.get("/conversations/list", getConversations);
export default router;