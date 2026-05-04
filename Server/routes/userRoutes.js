const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const {registerSchema, loginSchema} = require("../validators/userValidator");
const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

router.post("/register", validate(registerSchema), userController.registerUser);
router.post("/login", validate(loginSchema), userController.loginUser);
router.get("/", auth, isAdmin, userController.getAllUsers);

module.exports = router;