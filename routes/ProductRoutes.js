const express = require("express");
const router = express.Router();

const { authMiddleware, isAdmin } = require("../middlewares/Auth");
const { createProduct, updateProduct, deleteProduct, getAllProducts } = require("../controllers/Product");

// 🧑‍💼 Admin Routes
router.post("/createProduct", authMiddleware, isAdmin, createProduct);
router.put("/updateProduct/:productId", authMiddleware, isAdmin, updateProduct);
router.delete("/deleteProduct/:productId", authMiddleware, isAdmin, deleteProduct);

// 👥 Public/User Routes
router.get("/allProduct", getAllProducts);

// router.get("/categoryProduct/:categoryId", getProductsByCategory);
// router.get("/:productId", getProductById);


module.exports = router;