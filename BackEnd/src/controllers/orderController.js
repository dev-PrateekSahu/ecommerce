const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const createOrder = asyncHandler(async (req,res)=>{
    const user = req.user;
    const cart = await Cart.findOne({user:user._id});
    if(!cart){
        throw new AppError("Cart not found",404);
    }
    const items = cart.items;
    if(items.length==0){
        throw new AppError("Order atleast one item",404);
    }
    const products = [];
    const sellerGroups = new Map();
    for(const item of items){
        const product = await Product.findById(item.product)
            .populate('seller', 'isActive');

        if(!product){
            throw new AppError("Product doesn't exist", 404);
        }

        if(!product.seller){
            throw new AppError("Seller not found", 404);
        }

        if(!product.seller.isActive){
            throw new AppError("This product is currently unavailable", 400);
        }

        if(item.quantity>product.stock){
            throw new AppError("Product out of stock", 400);
        }

        const sellerId = product.seller._id.toString();
        if(!sellerGroups.has(sellerId)){
            sellerGroups.set(sellerId,[]);
        }
        sellerGroups.get(sellerId).push({
            product: product._id,
            quantity: item.quantity,
            price: product.price
        });
        products.push({
            product,
            quantity:item.quantity
        });

    }
    for(const [sellerId,sellerItems] of sellerGroups){
        let total = 0;
        for(const item of sellerItems){
            total += item.price*item.quantity;
        }
        await Order.create({
            user:user._id,
            seller:sellerId,
            items:sellerItems,
            totalAmount: total,
            status:"confirmed"
        });
    }
    for (const { product, quantity } of products) {
        product.stock -= quantity;
        await product.save();
    }
    cart.items = [];
    await cart.save();
    res.status(200).json({
        success: true,
        message: "Orders created successfully"
    });


});

const getOrders = asyncHandler(async (req,res)=>{
    const user = req.user;
    const orders = await Order.find({user:user._id}).populate('items.product');
    if(orders.length==0){
        throw new AppError("Order not found",404);
    }
    res.status(200).json({
        success:true,
        message:"These are your all orders",
        orders
    });
});

const getOrder = asyncHandler(async (req,res)=>{
    const user = req.user;
    const order = await Order.findOne({user:user._id, _id:req.params.id}).populate('items.product');
    if(!order){
        throw new AppError("Order not found",404);
    }
    res.status(200).json({
        success:true,
        message:"These is your searched order",
        order
    });
});

const getSellerOrders = asyncHandler(async (req,res)=>{
    const orders = await Order.find({seller:req.user._id}).populate('items.product');
    if(orders.length==0){
        throw new AppError("Order not found",404);
    }
    res.status(200).json({
        success:true,
        message:"These is your searched order",
        orders
    });
});

const getSellerOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOne({_id:req.params.id,seller:req.user._id}).populate('items.product');
    if(!order){
        throw new AppError("Order not found",404);
    }
    res.status(200).json({
        success:true,
        message:"These is your searched order",
        order
    });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.id,
        seller: req.user._id
    });

    if(!order){
        throw new AppError("Order not found", 404);
    }

    const{status} = req.body;

    const allowedTransitions = {
        confirmed: ["shipped", "cancelled"],
        shipped: ["delivered"],
        delivered: [],
        cancelled: []
    };

    if(!allowedTransitions[order.status]?.includes(status)){
        throw new AppError(
            `Cannot change order status from ${order.status} to ${status}`,
            400
        );
    }
    order.status = status;
    await order.save();
    res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order
    });
});

module.exports = {createOrder,getOrders,getOrder,getSellerOrders,getSellerOrder,updateOrderStatus};