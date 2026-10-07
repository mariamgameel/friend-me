const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const { createRequestSchema, updateStatusSchema } = require("../validators/adoptionValidator");
const adoptionController = require("../controllers/adoptionController");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

router.post("/", auth, validate(createRequestSchema), adoptionController.createAdoptionRequest);
router.get("/me", auth, adoptionController.getMyRequests);
router.put("/:id/cancel", auth, adoptionController.cancelMyRequest);

// Admin routes
router.get("/", auth, isAdmin, adoptionController.getAllRequests);
router.put("/:id", auth, isAdmin, validate(updateStatusSchema), adoptionController.updateRequestStatus);

module.exports = router;