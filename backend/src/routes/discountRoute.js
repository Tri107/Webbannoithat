import express from 'express';
import discountController from '../controllers/discountController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/', verifyToken, discountController.getDiscounts);
router.post('/', verifyToken, verifyAdmin, discountController.createDiscount);
router.put('/:discountId', verifyToken, verifyAdmin, discountController.updateDiscount);
router.delete('/:discountId', verifyToken, verifyAdmin, discountController.deleteDiscount);

export default router;
