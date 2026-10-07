const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: {
        type: String,
        default: ""
    }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        default: "",
        trim: true
    },
    street: {
        type: String,
        default: "",
        trim: true
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: [v => Array.isArray(v) && v.length > 0, "Order must have at least one item"]
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    paymentMethod: {
        type: String,
        default: "Cash on Delivery",
        enum: ["Cash on Delivery"]
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    shippingFee: {
        type: Number,
        default: 10,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    }
}, { timestamps: true });

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
