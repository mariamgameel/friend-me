const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    changePasswordSchema
} = require("../validators/userValidator");
const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");
const { authLimiter } = require("../middlewares/rateLimiter");

router.post("/register", authLimiter, validate(registerSchema), userController.registerUser);
router.post("/login", authLimiter, validate(loginSchema), userController.loginUser);

// Profile
router.get("/me", auth, userController.getProfile);
router.put("/me", auth, validate(updateProfileSchema), userController.updateProfile);
router.put("/me/password", auth, validate(changePasswordSchema), userController.changePassword);

// Favorites
router.get("/me/favorites", auth, userController.getFavorites);
router.post("/me/favorites/:dogId", auth, userController.addFavorite);
router.delete("/me/favorites/:dogId", auth, userController.removeFavorite);

// Admin user directory
router.get("/", auth, isAdmin, userController.getAllUsers);

module.exports = router;