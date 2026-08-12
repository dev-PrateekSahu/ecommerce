const express = require('express');

const {getProducts,createProduct,getProduct,updateProduct,deleteProduct} = require('../controllers/productController');

const router = express.Router();
const isAdmin = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {createProductSchema} = require('../validations/productValidation');

router.get('/',getProducts);
router.get('/:id',getProduct);
router.post('/',authMiddleware,isAdmin,validate(createProductSchema),createProduct);
router.patch('/:id',authMiddleware,isAdmin,updateProduct);
router.delete('/:id',authMiddleware,isAdmin,deleteProduct);

module.exports = router;