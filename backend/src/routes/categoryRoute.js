import express from 'express';
import categoryController from '../controllers/categoryController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/', categoryController.getCagories);
router.post('/', verifyToken, verifyAdmin, categoryController.createCategory);
router.put('/:categoryId', verifyToken, verifyAdmin, categoryController.updateCategory);
router.delete('/:categoryId', verifyToken, verifyAdmin, categoryController.deleteCategory);

export default router;