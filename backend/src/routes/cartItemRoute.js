import express from 'express';
import cartItemController from '../controllers/cartItemController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/:accountId', verifyToken, cartItemController.getCartItems);
router.post('/', verifyToken, cartItemController.addCartItem);
router.put('/:cartItemId', verifyToken, cartItemController.updateCartItem);
router.delete('/clear', verifyToken, cartItemController.clearCart);
router.delete('/:cartItemId', verifyToken, cartItemController.removeCartItem);
router.patch('/:cartItemId/color', verifyToken, cartItemController.updateCartItemColor);

export default router;