const express = require("express");
const router = express.Router();

const { authMiddleware, isAdmin } = require("../middlewares/Auth");
const { createOrder, getUserOrders, cancelOrderItem, getAllUsers, getOrdersByUserId, cancelOrderItemByAdmin, updateOrderItemStatusByAdmin, verifyPayment } = require("../controllers/Order");

// 🧑‍💼 Admin Routes
router.get("/getAllUsers",authMiddleware, isAdmin, getAllUsers );
router.get("/getOrdersByUserId/:userId",authMiddleware, isAdmin, getOrdersByUserId  );
router.post("/cancelOrderItemByAdmin/:userId",authMiddleware, isAdmin, cancelOrderItemByAdmin  );
router.put("/updateOrderItemStatusByAdmin",authMiddleware, isAdmin, updateOrderItemStatusByAdmin );


// router.put("/updateProduct/:productId", authMiddleware, isAdmin, updateProduct);
// router.delete("/deleteProduct/:productId", authMiddleware, isAdmin, deleteProduct);

// 👥 Public/User Routes
router.post("/createOrder", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.post("/cancelOrderItem", authMiddleware, cancelOrderItem);
router.get("/getUserOrders",authMiddleware,  getUserOrders );

// router.get("/categoryProduct/:categoryId", getProductsByCategory);
// router.get("/:productId", getProductById);


module.exports = router;