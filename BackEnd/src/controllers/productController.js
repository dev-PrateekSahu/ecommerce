const Product = require('../models/Product');
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
    const product = await Product.findById(req.params.id,);

    if (!product) {
        throw new AppError("Product not found", 404);
    }
    if (product.seller.toString() !== req.user._id.toString()) {
        throw new AppError("Not Authorised", 403);
    }
    
    const { name, description, price, stock } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;

    await product.save();

    res.json({
        success: true,
        product
    });
});

const deleteProduct = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new AppError("Product not found", 404);
    }
    if(product.seller.toString() !== req.user._id.toString()){
        throw new AppError("Not Authorised", 403);
    }
    await product.deleteOne();
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
        stock,
        seller:req.user._id
    });

    res.status(201).json({
        success: true,
        product
    });
});

module.exports = {
    getProducts, createProduct, updateProduct, deleteProduct, getProduct
};