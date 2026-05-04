const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const {createProductSchema, updateProductSchema} = require("../validators/productValidator");
const productController = require("../controllers/productController");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

router.post("/", auth, isAdmin,validate(createProductSchema) , productController.createProduct);
router.put("/:id", auth, isAdmin,validate(updateProductSchema) , productController.updateProduct);
router.delete("/:id", auth, isAdmin, productController.deleteProduct);

module.exports = router;

