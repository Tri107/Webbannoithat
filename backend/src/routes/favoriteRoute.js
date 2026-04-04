import express from 'express';
import favoriteController from '../controllers/favoriteController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/', verifyToken, favoriteController.getFavorites);
router.post('/', verifyToken, favoriteController.addFavorite);
router.delete('/', verifyToken, favoriteController.removeFavorite);
router.get('/:accountId', verifyToken, favoriteController.getFavoritesByAccountId);

export default router;
