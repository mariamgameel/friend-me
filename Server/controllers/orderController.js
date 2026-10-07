const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { sendMailSafely } = require("../utils/mailer");

const createOrder = catchAsync(async (req, res, next) => {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return next(new AppError("Order must contain at least one item", 400));
    }

    const decremented = [];
    const orderItems = [];
    let subtotal = 0;

    try {
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new AppError("One or more selected products were not found", 404);
            }

            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );

            if (!updatedProduct) {
                throw new AppError(`Insufficient stock for "${product.name}". Only ${product.stock} left in stock.`, 400);
            }

            decremented.push({ product: item.product, quantity: item.quantity });

            const lineTotal = Number(product.price) * Number(item.quantity);
            subtotal += lineTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: Number(product.price),
                quantity: Number(item.quantity),
                image: product.image || ""
            });
        }
    } catch (err) {
        // Rollback any successfully decremented items in this transaction loop
        for (const done of decremented) {
            await Product.findByIdAndUpdate(done.product, { $inc: { stock: done.quantity } });
        }
        return next(err);
    }

    subtotal = parseFloat(subtotal.toFixed(2));
    const shippingFee = subtotal >= 100 ? 0 : 10;
    const total = parseFloat((subtotal + shippingFee).toFixed(2));

    const order = await Order.create({
        user: req.user.id,
        items: orderItems,
        shippingAddress,
        paymentMethod: "Cash on Delivery",
        subtotal,
        shippingFee,
        total,
        status: "Pending"
    });

    // Optional email confirmation
    if (req.user?.email) {
        sendMailSafely({
            to: req.user.email,
            subject: `Order Confirmed #${order._id.toString().slice(-6)}`,
            text: `Thank you for your order! Total: $${total}. Payment method: Cash on Delivery. Status: Pending.`
        });
    }

    res.status(201).json({ success: true, data: order });
});

const getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
});

const getAllOrders = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 20, all } = req.query;
    const query = {};

    if (status && ["Pending", "Shipped", "Delivered", "Cancelled"].includes(status)) {
        query.status = status;
    }

    const total = await Order.countDocuments(query);

    if (all === "true") {
        const orders = await Order.find(query)
            .populate("user", "username email")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: orders,
            meta: { total, page: 1, pages: 1, limit: total }
        });
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (currentPage - 1) * parsedLimit;
    const pages = Math.ceil(total / parsedLimit) || 1;

    const orders = await Order.find(query)
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit);

    res.status(200).json({
        success: true,
        data: orders,
        meta: {
            total,
            page: currentPage,
            pages,
            limit: parsedLimit
        }
    });
});

const updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError("Order not found", 404));

    // If order is being cancelled from an active state, restore inventory
    if (status === "Cancelled" && order.status !== "Cancelled") {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, data: order });
});

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus
};
