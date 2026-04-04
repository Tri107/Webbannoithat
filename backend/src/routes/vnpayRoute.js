import express from "express";
import { createPaymentUrl, vnpayReturn } from "../controllers/vnpayController.js";

const router = express.Router();

router.post("/create-payment-url", createPaymentUrl);
router.get("/return", vnpayReturn);

export default router;