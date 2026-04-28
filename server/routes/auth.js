const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

router.post('/captcha/generate', authController.generateSliderCaptcha);

router.post('/captcha/verify', authController.verifySliderCaptcha);

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', authMiddleware, authController.logout);

router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
