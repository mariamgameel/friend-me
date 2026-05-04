const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const {createDogSchema, updateDogSchema} = require("../validators/dogValidator");
const dogController = require("../controllers/dogController");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

router.get("/", dogController.getAllDogs);
router.get("/:id", dogController.getDogById);
router.post("/", auth, isAdmin, validate(createDogSchema), dogController.createDog);
router.put("/:id", auth, isAdmin, validate(updateDogSchema), dogController.updateDog);
router.delete("/:id", auth, isAdmin, dogController.deleteDog);

module.exports = router;