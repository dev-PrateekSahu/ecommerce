const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const addToCart = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    const {productId, quantity} = req.body;
    const product = await Product.findOne({_id:productId});
    if(!product){
        throw new AppError("Product doesn't exist",400);
    }
    const stock = product.stock;
    const cart = await Cart.findOne({user:userId});
    if(!cart){
        const createdCart = await Cart.create({
            user:userId
        });
        if(stock>=quantity){
            createdCart.items.push({
                product:productId,
                quantity
            });
            await createdCart.save();
            res.status(200).json({
                success: true,
                message: "Product added to cart"
            });
        }else{
            throw new AppError("Out of stock",400);
        }
    }else{
        const item = cart.items.find(item=>item.product==productId);
        if(item==undefined){
            if(stock>=quantity){
                cart.items.push({
                    product:productId,
                    quantity
                });
                await cart.save();
                res.status(200).json({
                    success: true,
                    message: "Product added to cart"
                });
            }else{
                throw new AppError("Out of Stock",400);
            }
        }else{
            const currQuantity = item.quantity;
            if(stock>=quantity+currQuantity){
                item.quantity = currQuantity + quantity;
                await cart.save();
                res.status(200).json({
                    success: true,
                    message: "Product added to cart"
                });
            }else{
                throw new AppError("Out of Stock",400);
            }
        }
    }
});

const viewCart = asyncHandler(async(req,res)=>{
    const cart = await Cart.findOne({user:req.user._id}).populate('items.product');
    if(!cart){
        throw new AppError("Cart Doesn't exists",400);
    }
    res.status(200).json({
        success: true,
        message: "This is your cart",
        cart
    });
});

const updateCart = asyncHandler(async(req,res)=>{
    const user = req.user;
    const {quantity} = req.body;
    const productId = req.params.id;
    const product = await Product.findOne({_id:productId});
    if(!product){
        throw new AppError("Product not found",404);
    }
    const cart = await Cart.findOne({user:user._id});
    if(!cart){
        throw new AppError("Cart not found",404);
    }
    const alreadyExist = cart.items.find(item=>item.product==productId);
    if(!alreadyExist){
        throw new AppError("Product not found",404);
    }

    const stock = product.stock;
    if(quantity<=stock){
        if(quantity==0){
            const index = cart.items.findIndex(item=>item.product==productId);
            cart.items.splice(index,1);
        }else{
            alreadyExist.quantity = quantity;
        }
        await cart.save();
        res.status(200).json({
            success:true,
            message:"Cart has been updated sucessfully"
        });
    }else{
        throw new AppError("Out of Stock",400);
    }
});

const deleteCart = asyncHandler(async (req,res)=>{
    const cart = await Cart.findOne({user:req.user._id});
    if(!cart){
        throw new AppError("Cart doesn't exist",404);
    }

    const index = cart.items.findIndex(item=>item.product==req.params.id)
    if(index==-1){
        throw new AppError("Product isn't in cart",400);
    }
    cart.items.splice(index,1);
    await cart.save();
    res.status(200).json({
        success: true,
        message:"Product has been removed from cart"
    })

});
module.exports = {addToCart,viewCart,updateCart,deleteCart};