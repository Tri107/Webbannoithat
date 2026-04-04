import express from 'express';
import collectionController from '../controllers/collectionController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/',  collectionController.getCollections);
router.post('/', verifyToken, verifyAdmin, collectionController.createCollection);
router.put('/:collectionId', verifyToken, verifyAdmin, collectionController.updateCollection);
router.delete('/:collectionId', verifyToken, verifyAdmin, collectionController.deleteCollection);

export default router;
