const express = require("express");
const router = express.Router();
const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  viewCart,
  getCartQuantity,
  getCartAmount,
  decreaseCartQuantity
  // clearCart
} = require("../controllers/Cart");
const { authMiddleware } = require("../middlewares/Auth"); // including both isAdmin and isCustomer

// Routes (protected by authMiddleware middleware)

// Customer routes: Only authenticated customers can perform these actions
router.post("/addToCart", authMiddleware, addToCart);              // Customers can add items to the cart
router.post("/decreaseCartQuantity", authMiddleware, decreaseCartQuantity);              // Customers can add items to the cart
router.delete("/removeFromCart", authMiddleware, removeFromCart);    // Customers can remove items from the cart
router.put("/updateToCart", authMiddleware, updateCartQuantity);  // Customers can update the quantity of items in the cart
router.get("/getCartQuantity", authMiddleware, getCartQuantity);  // Customers can update the quantity of items in the cart
router.get("/getCartAmount", authMiddleware, getCartAmount);  // Customers can update the quantity of items in the cart
router.get("/viewCart", authMiddleware, viewCart);                   // Customers can view their cart
// router.delete("/clearCart", authMiddleware,clearCart);          // Customers can clear their cart

// // Admin routes: Admin can access carts for other users (optional)
// router.get("/admin/view/:userId", authMiddleware, isAdmin, viewCart);    // Admin can view any user's cart (userId as param)
// router.delete("/admin/clear/:userId", authMiddleware, isAdmin, clearCart); // Admin can clear any user's cart (userId as param)

module.exports = router;