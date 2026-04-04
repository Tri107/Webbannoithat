import express from 'express';
import brandController from '../controllers/brandController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/',brandController.getBrands);
router.post('/', verifyToken, verifyAdmin, brandController.createBrand);
router.put('/:brandId', verifyToken, verifyAdmin, brandController.updateBrand);
router.delete('/:brandId', verifyToken, verifyAdmin, brandController.deleteBrand);

export default router;