const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const isAdmin = asyncHandler(async (req,res,next)=>{
    const user = req.user;
    if (req.user.role !== "admin") {
        throw new AppError("Admin access required", 403);
    }
    next();
});

module.exports = isAdmin;