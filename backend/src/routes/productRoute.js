import express from 'express';
import productController from '../controllers/productController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; 
import { uploadMultiple, upload3dModel } from '../middlewares/uploadMiddleware.js';


const router = express.Router();

router.get('/', productController.getAll);
router.get("/home-featured", productController.getFeaturedProducts);
router.get("/home-collections", productController.getHomeCollections);
router.get('/:id', productController.getById);

router.post('/add-product', verifyToken, productController.create);
router.post('/add-variant', verifyToken, productController.createVariant);
router.post('/images', verifyToken, uploadMultiple, productController.uploadImages);
router.post('/model3d', verifyToken, upload3dModel, productController.upload3dModel);


router.put('/variant/:variantRef', verifyToken, productController.updateVariant);
router.put('/images/:variantRef', verifyToken, uploadMultiple, productController.updateImages);
router.put('/model3d/:variantRef', verifyToken, upload3dModel, productController.updateModel);
router.put('/:id', verifyToken, productController.updateProduct);

export default router;