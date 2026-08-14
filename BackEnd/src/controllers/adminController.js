const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const SellerModel = require('../models/sellerApplication');

const getAllUsers = asyncHandler(async (req, res) => {
   const users = await User.find().select('-password');
   res.status(200).json({
    success:true,
    users
   });
});

const getAllSellers = asyncHandler(async (req, res) => {
   const sellers = await User.find({role:'seller'}).select('-password');
   res.status(200).json({
    success:true,
    sellers
   });
});

const getAllProducts = asyncHandler(async (req, res) => {
   const products = await Product.find().populate('seller','name email');
   res.status(200).json({
    success:true,
    products
   });
});


const getAllOrders = asyncHandler(async (req,res)=>{
    const orders = await Order.find()
    .populate('user', 'name email')
    .populate('seller', 'name email')
    .populate('items.product');
    res.status(200).json({
        success:true,
        orders
   });
});


const updateSellerStatus = asyncHandler(async (req, res) => {
    const seller = await User.findOne({
        _id:req.params.id,
        role:"seller"
    });
    if(!seller){
        throw new AppError("Seller not found", 404);
    }
    seller.isActive = req.body.isActive;
    await seller.save();

    const sellerResponse = seller.toObject();
    delete sellerResponse.password;

    res.status(200).json({
        success: true,
        message: "Seller status updated successfully",
        seller: sellerResponse
    });
});

const getSellerApplications = asyncHandler(async (req,res)=>{
    const sellerApplications = await SellerModel.find().populate('user','name email');
    res.status(200).json({
        success:true,
        sellerApplications
    });
});

const approveSellerApplication = asyncHandler(async (req, res) => {
    const application = await SellerModel.findOne({_id:req.params.id});
    if(!application){
        throw new AppError("Seller application not found",404);
    }
    if(application.status!='pending'){
        throw new AppError("Application has already been processed",400);
    }
    const user = await User.findOne({_id:application.user});
    if (!user) {
        throw new AppError("User not found", 404);
    }
    user.role = "seller";
    user.isActive = true;
    application.status = "approved";
    await user.save();
    await application.save();
    res.status(200).json({
        success:true,
        message:"Application has been approved"
    });
});

const rejectSellerApplication = asyncHandler(async (req, res) => {
    const application = await SellerModel.findOne({_id:req.params.id});
    if(!application){
        throw new AppError("Seller application not found",404);
    }
    if(application.status!='pending'){
        throw new AppError("Application has already been processed",400);
    }
    application.status = "rejected";
    await application.save();
    res.status(200).json({
        success:true,
        message:"Application has been rejected"
    });
});

module.exports = {
    getAllUsers,
    getAllSellers,
    getAllProducts,
    getAllOrders,
    updateSellerStatus,
    getSellerApplications,
    approveSellerApplication,
    rejectSellerApplication
};