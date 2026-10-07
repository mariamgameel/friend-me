const express = require("express");
const router = express.Router();
const { getAdminStats } = require("../controllers/statsController");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

router.get("/stats", auth, isAdmin, getAdminStats);

module.exports = router;
