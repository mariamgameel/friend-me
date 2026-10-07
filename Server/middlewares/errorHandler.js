const AppError = require("../utils/AppError");

const notFound = (req, res, next) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.isOperational ? err.message : "Something went wrong on our end";

    // Handle Mongo duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0] || "field";
        message = `A record with this ${field} already exists`;
    } else if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    } else if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if (statusCode === 500) console.error(err);

    res.status(statusCode).json({
        success: false,
        message,
        ...(err.errors && { errors: err.errors })
    });
};

module.exports = { notFound, errorHandler };