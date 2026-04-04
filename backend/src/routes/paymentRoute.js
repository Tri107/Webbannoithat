import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/', verifyToken,  paymentController.getPayments);
router.post('/', verifyToken, verifyAdmin, paymentController.createPayment);
router.put('/:paymentId', verifyToken, verifyAdmin, paymentController.updatePayment);
router.delete('/:paymentId', verifyToken, verifyAdmin, paymentController.deletePayment);

export default router;
