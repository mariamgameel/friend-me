const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const { createOrderSchema, updateOrderStatusSchema } = require("../validators/orderValidator");
const orderController = require("../controllers/orderController");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

router.post("/", auth, validate(createOrderSchema), orderController.createOrder);
router.get("/me", auth, orderController.getMyOrders);

// Admin routes
router.get("/", auth, isAdmin, orderController.getAllOrders);
router.put("/:id/status", auth, isAdmin, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
