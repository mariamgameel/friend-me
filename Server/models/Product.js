const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        enum: ["Food", "Toys", "Beds", "Walking", "Grooming", "Travel", "Other"],
        default: "Other"
    },
    featured: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    image: {
        type: String,
        default: ""
    }
}, { timestamps: true });

productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model("Product", productSchema);