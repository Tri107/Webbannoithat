
import express from "express";
import accountRoute from "./accountRoute.js";
import authRoute from "./authRoute.js";
import profileRoute from "./profileRoute.js";
import categoryRoute from "./categoryRoute.js";
import brandRoute from "./brandRoute.js";
import collectionRoute from "./collectionRoute.js";
import discountRoute from "./discountRoute.js";
import paymentRoute from "./paymentRoute.js";
import favoriteRoute from "./favoriteRoute.js";
import reviewRoute from "./reviewRoute.js";
import productRoute from "./productRoute.js";
import cartItemRoute from "./cartItemRoute.js";
import orderRoute from "./orderRoute.js";
import chatRoute from './chatRoute.js';
import dashboardRoute from './dashboardRoute.js';
import vnpayRoute from "./vnpayRoute.js";

const router = express.Router();

router.use("/account", accountRoute);
router.use("/auth", authRoute);
router.use("/profile", profileRoute);
router.use("/categories", categoryRoute);
router.use("/brands", brandRoute);
router.use("/collections", collectionRoute);
router.use("/discounts", discountRoute);
router.use("/payments", paymentRoute);
router.use("/favorites", favoriteRoute);
router.use("/reviews", reviewRoute);
router.use("/products", productRoute);
router.use("/cart-items", cartItemRoute);
router.use("/orders", orderRoute);
router.use('/chat', chatRoute);
router.use('/dashboard', dashboardRoute);
router.use("/vnpay", vnpayRoute);


export default router;