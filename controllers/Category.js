const Category = require("../models/Category");
const Product = require("../models/Product");

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if all fields are provided
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if the category with the same name already exists
        const existingCategory = await Category.findOne({ name: name.trim().toLowerCase() });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        // Create new category
        const categoryDetails = await Category.create({
            name: name.trim().toLowerCase(),
            description: description.trim().toLowerCase(),
        });

        console.log(categoryDetails);

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
        });

    } catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({
            success: false, // ✅ Fix this (was mistakenly `true` in your original code)
            message: error.message || "Internal server error",
        });
    }
};


const showAllCategories = async (req, res) => {
    try {
        const allCategorys = await Category.find()
        res.status(200).json({
            success: true,
            data: allCategorys,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

const deleteCategory = async(req, res) => {
    try {
        const { categoryId } = req.params;
        console.log(categoryId);
    
        // Find the category
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(404).json({
            success: false,
            message: "Category not found",
          });
        }
    
        // Optional: Delete all products in this category
        await Product.deleteMany({ category: categoryId });
    
        // Delete the category
        await Category.findByIdAndDelete(categoryId);
    
        res.status(200).json({
          success: true,
          message: "Category deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        });
      }
}



module.exports = { createCategory, showAllCategories, deleteCategory };