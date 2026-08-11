const errorMiddleware = (err, req, res, next) => {

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

module.exports = errorMiddleware;