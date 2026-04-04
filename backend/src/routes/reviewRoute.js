import express from 'express';
import reviewController from '../controllers/reviewController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', reviewController.getReviews);
router.get('/permission/:productId', verifyToken, reviewController.getReviewPermission);
router.post('/', verifyToken, reviewController.createReview);
router.put('/:reviewId', verifyToken, reviewController.updateReview);
router.delete('/:reviewId', verifyToken, reviewController.deleteReview);

export default router;