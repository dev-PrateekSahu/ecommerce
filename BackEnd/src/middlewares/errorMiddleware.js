const errorMiddleware = (err, req, res, next) => {
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID'
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err.code === 11000) {
        const fields = Object.keys(err.keyPattern || {});
        const field = fields.length ? fields.join(', ') : 'field';

        return res.status(409).json({
            success: false,
            message: `Duplicate value for ${field}`
        });
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON payload'
        });
    }

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorMiddleware;
