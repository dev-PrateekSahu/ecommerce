const express = require('express');
const router = express.Router();
const {createOrder,getOrders,getOrder} = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/',authMiddleware,createOrder);
router.get('/',authMiddleware,getOrders);
router.get('/:id',authMiddleware,getOrder);

module.exports = router;