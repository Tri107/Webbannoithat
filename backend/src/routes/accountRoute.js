import express from 'express';
import AccountController from '../controllers/accountController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, AccountController.getAll);
router.get('/:id', verifyToken, AccountController.getById);
router.post('/', verifyAdmin, AccountController.create);
router.put('/:id', verifyAdmin, AccountController.update);
router.put('/:id/password', verifyToken, AccountController.updatePassword);
router.delete('/:id', verifyAdmin, AccountController.softDelete);
router.patch('/:id/restore', verifyAdmin, AccountController.restore);

export default router;