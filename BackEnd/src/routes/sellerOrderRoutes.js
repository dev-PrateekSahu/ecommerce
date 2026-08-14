const express = require('express');
const router = express.Router();

const {
    getSellerOrders,
    getSellerOrder,
    updateOrderStatus
} = require('../controllers/orderController');

const authMiddleware = require('../middlewares/authMiddleware');
const sellerMiddleware = require('../middlewares/sellerMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { updateOrderStatusSchema } = require('../validations/orderValidation');
router.get(
    '/',
    authMiddleware,
    sellerMiddleware,
    getSellerOrders
);

router.get(
    '/:id',
    authMiddleware,
    sellerMiddleware,
    getSellerOrder
);

router.patch(
    '/:id/status',
    authMiddleware,
    sellerMiddleware,
    validate(updateOrderStatusSchema),
    updateOrderStatus
);

module.exports = router;