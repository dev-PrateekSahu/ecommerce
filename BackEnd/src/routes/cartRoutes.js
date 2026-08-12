const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {addToCartSchema,updateCartSchema} = require('../validations/cartValidation');
const router = express.Router();
const {addToCart,viewCart,updateCart,deleteCart} = require('../controllers/cartController');

router.post("/",authMiddleware,validate(addToCartSchema),addToCart);
router.get('/',authMiddleware,viewCart);
router.patch('/:id',authMiddleware,validate(updateCartSchema),updateCart);
router.delete('/:id',authMiddleware,deleteCart);
module.exports = router;