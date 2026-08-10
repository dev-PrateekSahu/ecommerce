const express = require('express');

const {getProducts} = require('../controllers/productController');
const router = express.Router();
console.log(getProducts);


router.get('/',getProducts);

module.exports = router;