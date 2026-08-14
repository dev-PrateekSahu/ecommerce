const AppError = require('../utils/AppError');

const sellerMiddleware = (req, res, next) => {
    if (req.user.role !== "seller") {
        throw new AppError("Seller access required", 403);
    }

    next();
};

module.exports = sellerMiddleware;