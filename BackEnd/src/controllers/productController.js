const Product = require('../models/product');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getProducts = asyncHandler(async(req, res) => {
    const products = await Product.find();
    res.json({
        success: true,
        products
    });
});

const getProduct = asyncHandler(async(req,res)=>{
    const product = await Product.findById(req.params.id);
    if(!product) throw new AppError('Product not found',404);
    res.json({
        success: true,
        product
    });
});

const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    res.json({
        success: true,
        product
    });
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    res.json({
        success: true,
        message: "Product deleted successfully"
    });
});

const createProduct = asyncHandler (async(req, res) => {
    let {name,description,price,stock} = req.body;
    const product = await Product.create({
        name,
        description,
        price,
        stock
    });

    res.status(201).json({
        success: true,
        product
    });
});

module.exports = {
    getProducts, createProduct, updateProduct, deleteProduct, getProduct
};