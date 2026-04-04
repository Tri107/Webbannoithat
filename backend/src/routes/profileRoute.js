import express from 'express';
import ProfileController from '../controllers/profileController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/me',verifyToken, ProfileController.getMyProfile);
router.put('/update',verifyToken, ProfileController.updateMyProfile);

export default router;