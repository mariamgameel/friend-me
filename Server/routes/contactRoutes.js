const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const { contactMessageSchema } = require("../validators/contactValidator");
const contactController = require("../controllers/contactController");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");
const { contactLimiter } = require("../middlewares/rateLimiter");

router.post("/", contactLimiter, validate(contactMessageSchema), contactController.createMessage);

// Admin routes
router.get("/", auth, isAdmin, contactController.getAllMessages);
router.put("/:id/read", auth, isAdmin, contactController.markMessageRead);
router.delete("/:id", auth, isAdmin, contactController.deleteMessage);

module.exports = router;
