const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Product = require("../models/Product");

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

const createProduct = catchAsync(async (req, res, next) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
});

const getProducts = catchAsync(async (req, res, next) => {
    const {
        q,
        category,
        minPrice,
        maxPrice,
        inStock,
        featured,
        sort,
        page = 1,
        limit = 12,
        all
    } = req.query;

    const query = {};

    if (q && typeof q === "string" && q.trim()) {
        const regex = new RegExp(escapeRegex(q.trim()), "i");
        query.$or = [{ name: regex }, { description: regex }];
    }

    if (category && typeof category === "string" && category !== "All") {
        query.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined && !isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
        if (maxPrice !== undefined && !isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
    }

    if (inStock === "true" || inStock === true) {
        query.stock = { $gt: 0 };
    }

    if (featured === "true" || featured === true) {
        query.featured = true;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "newest") sortOptions = { createdAt: -1 };
    else if (sort === "priceAsc") sortOptions = { price: 1 };
    else if (sort === "priceDesc") sortOptions = { price: -1 };
    else if (sort === "nameAsc") sortOptions = { name: 1 };

    const total = await Product.countDocuments(query);

    if (all === "true") {
        const products = await Product.find(query).sort(sortOptions);
        return res.status(200).json({
            success: true,
            data: products,
            meta: { total, page: 1, pages: 1, limit: total }
        });
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (currentPage - 1) * parsedLimit;
    const pages = Math.ceil(total / parsedLimit) || 1;

    const products = await Product.find(query).sort(sortOptions).skip(skip).limit(parsedLimit);

    res.status(200).json({
        success: true,
        data: products,
        meta: {
            total,
            page: currentPage,
            pages,
            limit: parsedLimit
        }
    });
});

const getProductById = catchAsync(async (req, res, next) => {
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