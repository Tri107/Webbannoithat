import express from 'express';
import orderController from '../controllers/orderController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, orderController.getAllOrders);
router.get('/user/:id', verifyToken, orderController.getOrdersByAccountId)
router.get('/:id', verifyToken, orderController.getOrderById);
router.post('/', verifyToken, orderController.createOrder);
router.put('/:id', verifyToken, verifyAdmin, orderController.updateOrderStatus);

export default router;
