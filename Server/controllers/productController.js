const Product = require("../models/Product");
const {
    createProductSchema,
    updateProductSchema
} = require ("../validators/productValidator");


const createProduct = async(req, res) => {
    try {
        const { error } = createProductSchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ msg: error.details.map(d => d.message) });
        const product = await Product.create(req.body);
        res.status(201).json({ succes: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getProducts = async(req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProductById = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProduct = async(req, res) => {
    try {
        const { error } = updateProductSchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ msg: error.details.map(d => d.message) });
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found"});
        res.status(200).json({ success: true, message: "Product deleted successfully"});
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};