const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const isAdmin = asyncHandler(async (req,res,next)=>{
    const user = req.user;
    if(user.role=='admin'){
        return next();
    }
    throw new AppError("You are authenticated, but you're not allowed to do this",403);
});

module.exports = isAdmin;