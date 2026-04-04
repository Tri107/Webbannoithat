import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();


router.post('/register', AuthController.register);
router.post('/register/verify', AuthController.verifyRegister);
router.post('/login', AuthController.login);
router.post('/google-login', AuthController.googleLogin);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

export default router;