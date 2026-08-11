const express = require('express');

const {getProducts,createProduct,getProduct,updateProduct,deleteProduct} = require('../controllers/productController');

const router = express.Router();
console.log(getProducts);


router.get('/',getProducts);
router.get('/:id',getProduct);
router.post('/',createProduct);
router.patch('/:id',updateProduct);
router.delete('/:id',deleteProduct);

module.exports = router;