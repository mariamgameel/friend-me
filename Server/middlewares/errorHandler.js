const AppError = require("../utils/AppError");

const notFound = (req, res, next) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : "Something went wrong on our end";
    if (!err.isOperational) console.error(err);
    res.status(statusCode).json({
        success: false,
        message,
        ...(err.errors && { errors: err.errors })
    });
};

module.exports = { notFound, errorHandler };