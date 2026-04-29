const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobbyController');
const authMiddleware = require('../middlewares/auth');

router.get('/rooms', lobbyController.getRooms);
router.get('/rooms/:roomNumber', lobbyController.getRoom);
router.get('/online-players', lobbyController.getOnlinePlayers);

router.post('/sit-down', authMiddleware, lobbyController.sitDown);
router.post('/leave-room', authMiddleware, lobbyController.leaveRoom);
router.post('/quick-start', authMiddleware, lobbyController.quickStart);

module.exports = router;
