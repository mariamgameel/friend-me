const catchAsync = require("../utils/catchAsync");
const Dog = require("../models/Dog");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const AdoptionRequest = require("../models/AdoptionRequest");

const getAdminStats = catchAsync(async (req, res) => {
    const [
        totalDogs,
        availableDogs,
        adoptedDogs,
        totalUsers,
        totalProducts,
        totalOrders,
        allCompletedOrders,
        lowStockProducts,
        recentRequests,
        pendingRequestsCount,
        approvedRequestsCount,
        rejectedRequestsCount,
        cancelledRequestsCount
    ] = await Promise.all([
        Dog.countDocuments(),
        Dog.countDocuments({ isAdopted: false }),
        Dog.countDocuments({ isAdopted: true }),
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.find({ status: { $ne: "Cancelled" } }).select("total createdAt"),
        Product.find({ stock: { $lte: 5 } }).select("name price stock category image").limit(10),
        AdoptionRequest.find()
            .populate("user", "username email")
            .populate("dog", "name breed image")
            .sort({ createdAt: -1 })
            .limit(5),
        AdoptionRequest.countDocuments({ status: "Pending" }),
        AdoptionRequest.countDocuments({ status: "Approved" }),
        AdoptionRequest.countDocuments({ status: "Rejected" }),
        AdoptionRequest.countDocuments({ status: "Cancelled" })
    ]);

    const totalRevenue = allCompletedOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);

    // Calculate last 6 months buckets
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString("en-US", { month: "short" });
        const year = d.getFullYear();
        const monthNum = d.getMonth();
        months.push({ key: `${key} ${year}`, year, monthNum, adoptions: 0, orders: 0 });
    }

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Fetch adoptions in last 6 months
    const approvedRequests = await AdoptionRequest.find({
        status: "Approved",
        updatedAt: { $gte: sixMonthsAgo }
    }).select("updatedAt");

    approvedRequests.forEach(req => {
        const d = new Date(req.updatedAt);
        const match = months.find(m => m.year === d.getFullYear() && m.monthNum === d.getMonth());
        if (match) match.adoptions++;
    });

    // Orders in last 6 months
    allCompletedOrders.forEach(ord => {
        const d = new Date(ord.createdAt);
        if (d >= sixMonthsAgo) {
            const match = months.find(m => m.year === d.getFullYear() && m.monthNum === d.getMonth());
            if (match) match.orders++;
        }
    });

    const adoptionsPerMonth = months.map(m => ({ month: m.key, count: m.adoptions }));
    const ordersPerMonth = months.map(m => ({ month: m.key, count: m.orders }));

    res.status(200).json({
        success: true,
        data: {
            totals: {
                dogs: totalDogs,
                availableDogs,
                adoptedDogs,
                users: totalUsers,
                products: totalProducts,
                orders: totalOrders,
                revenue: parseFloat(totalRevenue.toFixed(2))
            },
            requestsByStatus: {
                Pending: pendingRequestsCount,
                Approved: approvedRequestsCount,
                Rejected: rejectedRequestsCount,
                Cancelled: cancelledRequestsCount
            },
            adoptionsPerMonth,
            ordersPerMonth,
            lowStockProducts,
            recentRequests
        }
    });
});

module.exports = { getAdminStats };
