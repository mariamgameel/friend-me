const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const {registerSchema, loginSchema} = require("../validators/userValidator");
const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");
const { authLimiter } = require("../middlewares/rateLimiter");

router.post("/register", authLimiter, validate(registerSchema), userController.registerUser);
router.post("/login", authLimiter, validate(loginSchema), userController.loginUser);
router.get("/", auth, isAdmin, userController.getAllUsers);

module.exports = router;