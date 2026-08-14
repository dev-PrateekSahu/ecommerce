const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const authMiddleware = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")) throw new AppError("Authentication Required",401);

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        
    } catch (error) {
        throw new AppError("Invalid or expired token", 401);
    }
    const user = await User.findOne({_id:decoded.id});
    if(!user) throw new AppError("User not found", 401);
    if (user.role=="seller" && !user.isActive) {
        throw new AppError("Your account has been disabled", 403);
    }
    req.user = user;
    next();
});

module.exports = authMiddleware;