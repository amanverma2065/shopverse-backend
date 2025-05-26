const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadImageToCloudinary } = require('../utils/imageuploader'); // Assume you have a utility for cloud image upload
const mongoose = require('mongoose');


function isFileTypeSupported(fetchedFileType, supportedTypes) {
  return supportedTypes.includes(fetchedFileType);
}
// Create a new product and update category with the product ID
const createProduct = async (req, res) => {
  try {
    const { name, description, price, offerPrice, categoryName, stock } = req.body;
    console.log(req.body);

    // Check if all required fields are provided
    if (!name || !description || !price || !categoryName || !stock) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if the category exists
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Upload image to cloud storage (Cloudinary or similar service)
    // const imageUrl = await imageUploader(image); // Assume imageUploader uploads the image
    const file = req.files.image;
    console.log("Fetched file :", file);

    const supportedTypes = ["jpg", "jpeg", "png"];

    const fetchedFileType = file.name.split(".").pop().toLowerCase();
    if (!isFileTypeSupported(fetchedFileType, supportedTypes)) {
      return res.status(400).json({ success: false, message: "Unsupported file type" });
    }

    const response = await uploadImageToCloudinary(file, "ecommerce");
    const imageUrl = response.secure_url;

    // Create the product
    const newProduct = new Product({
      name,
      description,
      price,
      offerPrice,
      category: category._id, // Link product to category by categoryId
      stock,
      imageUrl: imageUrl,
    });

    // Save the product
    await newProduct.save();

    // Update the category with the new product ID
    category.products.push(newProduct._id);
    await category.save();

    // Return the newly created product
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};


// Update an existing product
const updateProduct = async (req, res) => {
  try {
    let { productId } = req.params;

    // Trim any leading or trailing whitespace/newline characters from the productId
    productId = productId.trim();

    // Validate that the productId is a valid ObjectId
    // if (!mongoose.Types.ObjectId.isValid(productId)) {
    //   return res.status(400).json({ success: false, message: 'Invalid Product ID' });
    // }

    const { name, description, price, offerPrice, stock, categoryName } = req.body;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update product details
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.offerPrice = offerPrice || product.offerPrice;
    product.stock = stock || product.stock;
    // product.category = categoryName || product.category;

    if (categoryName) {
      const category = await Category.findOne({ name: categoryName });
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      product.category = category._id; // Use the ObjectId, not the name
    }

    // Handle image update if a new image is provided
    if (req.files && req.files.image) {
      const fetchedFile = req.files.image;
      const supportedTypes = ["jpg", "jpeg", "png"];
      const fetchedFileType = fetchedFile.name.split(".").pop().toLowerCase();

      if (!isFileTypeSupported(fetchedFileType, supportedTypes)) {
        return res.status(400).json({
          success: false,
          message: "File type not supported.",
        });
      }

      const response = await uploadImageToCloudinary(fetchedFile, "ecommerce");
      console.log("Updated image uploaded to Cloudinary:", response.secure_url);
      product.imageUrl = response.secure_url; // update the image URL
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Step 1: Find and delete the product
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Step 2: Remove product reference from the category's products array
    await Category.findByIdAndUpdate(
      product.category, // assuming product has a 'category' field
      { $pull: { products: productId } }
    );

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category') // Populate category details
      .exec();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// Get a single product by ID
// const getProductById = async (req, res) => {
//   try {
//     const { productId } = req.params;

//     // Find the product by ID
//     const product = await Product.findById(productId)
//       .populate('category') // Populate category details
//       .exec();

//     if (!product) {
//       return res.status(404).json({ success: false, message: 'Product not found' });
//     }

//     res.status(200).json({
//       success: true,
//       data: product,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching product',
//       error: error.message,
//     });
//   }
// };

// const getProductsByCategory = async (req, res) => {
//   try {
//     const { categoryId } = req.params;

//     const products = await Product.find({ category: categoryId }).populate("category");

//     if (!products || products.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No products found for this category",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Products fetched successfully",
//       products,
//     });
//   } catch (error) {
//     console.error("Error in getProductsByCategory:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching products by category",
//     });
//   }
// };

// module.exports = {
//   createProduct ,
//   updateProduct ,
//   deleteProduct ,
//   getAllProducts ,
//   getProductById ,
//   getProductsByCategory
// }

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  // getProductById,
  // getProductsByCategory
}