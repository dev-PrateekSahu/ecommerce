const {application} = require('../controllers/sellerApplicationController');
const authMiddleware = require('../middlewares/authMiddleware');
const express = require('express');
const router = express.Router();

router.post('/',authMiddleware,application);

module.exports = router;