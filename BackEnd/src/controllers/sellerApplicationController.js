const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const sellerModel = require('../models/sellerApplication');

const application = asyncHandler(async(req,res)=>{
    const user = req.user;
    if(user.role=="seller"){
        throw new AppError("You are already a seller",400);
    }
    if (user.role === "admin") {
        throw new AppError("Admin cannot apply to become a seller", 400);
    }
    const application = await sellerModel.findOne({user:user._id});
    if(application){
        throw new AppError("You have already applied",400);
    }
    await sellerModel.create({
        user:user._id
    })
    res.status(201).json({
        success:true,
        message:"Your application has been submitted"
    })
});


module.exports = {application};