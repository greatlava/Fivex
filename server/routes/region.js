const express = require('express');
const router = express.Router();
const regionController = require('../controllers/regionController');
const authMiddleware = require('../middlewares/auth');

router.get('/', regionController.getRegions);

router.post('/', authMiddleware, regionController.createRegion);
router.put('/:id', authMiddleware, regionController.updateRegion);
router.delete('/:id', authMiddleware, regionController.deleteRegion);

module.exports = router;
