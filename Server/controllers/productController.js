const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Product = require("../models/Product");


const createProduct = catchAsync(async(req, res, next) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
});


const getProducts = catchAsync(async(req, res, next) => {
    const products = await Product.find();
    res.status(200).json({ success: true, data: products });
});


const getProductById = catchAsync(async(req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({ success: true, data: product });
});


const updateProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({ success: true, data: product });
});


const deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({ success: true, message: "Product deleted successfully" });
});


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};