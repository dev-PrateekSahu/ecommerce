const express = require('express');

const {getProducts,createProduct,getProduct,updateProduct,deleteProduct} = require('../controllers/productController');

const router = express.Router();
const sellerMiddleware = require('../middlewares/sellerMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {createProductSchema,updateProductSchema} = require('../validations/productValidation');

router.get('/',getProducts);
router.get('/:id',getProduct);
router.post('/',authMiddleware,sellerMiddleware,validate(createProductSchema),createProduct);
router.patch('/:id',authMiddleware,sellerMiddleware,validate(updateProductSchema),updateProduct);
router.delete('/:id',authMiddleware,sellerMiddleware,deleteProduct);

module.exports = router;