const express = require("express");
const router = express.Router();

const { authMiddleware, isAdmin } = require("../middlewares/Auth");
const { createCategory, showAllCategories, deleteCategory } = require("../controllers/Category");


// Create new category (Admin only)
router.post("/createCategory", authMiddleware, isAdmin, createCategory);

// Get all categories (Public)
router.get("/allCategories", showAllCategories);

// Get category page details (products inside category) - Public
// router.post("/details", categoryPageDetails);
 
router.delete("/deleteCategory/:categoryId", authMiddleware, isAdmin, deleteCategory);
module.exports = router;

