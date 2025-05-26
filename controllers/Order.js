const instance = require("../config/razorpay");
const crypto = require("crypto");

const Cart = require("../models/Cart");
const Order = require("../models/Order")
const Address = require("../models/Address");
const mailSender = require("../utils/mailsender");
const User = require("../models/User");

// const createOrder = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userData = await User.findOne({ _id: userId });
//     const userEmail = userData.email;

//     if (!userId) {
//       return res.status(404).json({ success: false, message: "User Login Required!" });
//     }

//     const { addressId, paymentType, orderAmount } = req.body;

//     const cart = await Cart.findOne({ user: userId }).populate("items.product");

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ success: false, message: "Cart is empty" });
//     }

//     const orderItems = cart.items.map(item => ({
//       product: item.product._id,
//       quantity: item.quantity,
//       itemOrderStatus: "Placed",
//       itemPaymentStatus: paymentType === "COD" ? "Pending" : "Paid",
//     }));

//     if (!paymentType || !["COD", "Online"].includes(paymentType)) {
//       return res.status(400).json({ success: false, message: "Invalid or missing payment type" });
//     }

//     const addressDoc = await Address.findById(addressId);
//     if (!addressDoc) {
//       return res.status(404).json({ success: false, message: "Address not found" });
//     }

//     const order = await Order.create({
//       user: userId,
//       address: addressDoc,
//       items: orderItems,
//       totalPrice: orderAmount,
//       paymentType: paymentType,
//       paymentStatus: paymentType === "COD" ? "Pending" : "Paid", // optionally assume "Paid" for online payments
//     });

//     // Clear cart
//     cart.items = [];
//     cart.totalPrice = 0;
//     cart.totalItems = 0;
//     await cart.save();

//     mailSender(userEmail, "Order Placed", `<h1>Your Order is Placed...</h1>`);
//     return res.status(201).json({ success: true, message: "Order placed", order });
//   } catch (error) {
//     console.error("Create Order Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to create order", error: error.message });
//   }
// };


const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await User.findOne({ _id: userId });
    const userEmail = userData.email;

    if (!userId) {
      return res.status(404).json({ success: false, message: "User Login Required!" });
    }

    const { addressId, paymentType, orderAmount } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      itemOrderStatus: "Placed",
      itemPaymentStatus: paymentType === "COD" ? "Pending" : "Paid",
    }));

    if (!paymentType || !["COD", "Online"].includes(paymentType)) {
      return res.status(400).json({ success: false, message: "Invalid or missing payment type" });
    }

    const addressDoc = await Address.findById(addressId);
    if (!addressDoc) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const order = await Order.create({
      user: userId,
      address: addressDoc,
      items: orderItems,
      totalPrice: orderAmount,
      paymentType: paymentType,
      paymentStatus: paymentType === "COD" ? "Pending" : "Paid", // optionally assume "Paid" for online payments
    });

    if (paymentType === "Online") {
      const options = {
        amount: orderAmount * 100, // convert to paise
        currency: "INR",
        receipt: `order_rcptid_${order._id}`,
      };

      const razorpayOrder = await instance.orders.create(options);

      return res.status(200).json({
        success: true,
        message: "Razorpay order created",
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        currency: razorpayOrder.currency,
      });
    }

    // Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    cart.totalItems = 0;
    await cart.save();

    mailSender(userEmail, "Order Placed", `<h1>Your Order is Placed...</h1>`);
    return res.status(201).json({ success: true, message: "Order placed", order });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create order", error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.REACT_APP_RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized access to order" });
    }

    // Optional: Prevent duplicate verification
    // if (order.paymentStatus === "Paid") {
    //   return res.status(400).json({ success: false, message: "Payment already verified" });
    // }

    // Update order with payment info
    order.paymentStatus = "Paid";
    order.razorpayDetails = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };
    await order.save();

    // ✅ Clear user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      cart.totalPrice = 0;
      cart.totalItems = 0;
      await cart.save();
    }

    // Send confirmation email
    const user = await User.findById(order.user);
    if (user) {
      await mailSender(user.email, "Payment Successful", `<h1>Your payment was successful for Order ID ${orderId}</h1>`);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified, order updated, and cart cleared",
      order,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};



const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(404).json({ success: false, message: "User Login Required!" });
    }

    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get Orders Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

const cancelOrderItem = async (req, res) => {
  try {
    const { orderId, productId } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(404).json({ success: false, message: "User Login Required!" });
    }

    const userData = await User.findOne({ _id: userId });
    const userEmail = userData.email;

    // Find the order
    const order = await Order.findById(orderId).populate("items.product");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Find the item in the order
    const itemIndex = order.items.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in order" });
    }

    const item = order.items[itemIndex];

    // Calculate amount to subtract
    const itemAmount = item.product.offerPrice * item.quantity;
    const itemAmountWithTax = Math.floor(itemAmount + (itemAmount * 0.02));
    order.totalPrice -= itemAmountWithTax;

    order.items[itemIndex].itemOrderStatus = "Cancelled";

    const allCancelled = order.items.every(i => i.itemOrderStatus === "Cancelled");
    order.orderStatus = allCancelled ? "Cancelled" : "Placed";
    order.paymentStatus = "Cancelled";

    if (order.orderStatus === "Cancelled") {
      order.totalPrice = 0;
      mailSender(userEmail, "Order Cancelled", `<h1>Your Order with id ${orderId} is cancelled...</h1>`);
    }

    await order.save();

    return res.status(200).json({ success: true, message: "Item cancelled", order });
  } catch (error) {
    console.error("Cancel Order Item Error:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel order item", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ accountType: "user" }).select("-password");

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ user: userId })
      .populate("items.product") // populate selected product fields
      .populate("address") // optional: populate full address
      .sort({ createdAt: -1 }); // latest orders first

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders for user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user orders",
    });
  }
};

const cancelOrderItemByAdmin = async (req, res) => {
  try {
    const { orderId, productId } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(404).json({ success: false, message: "User Login Required!" });
    }

    const userData = await User.findOne({ _id: userId });
    const userEmail = userData.email;

    // Find the order
    const order = await Order.findById(orderId).populate("items.product");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Find the item in the order
    const itemIndex = order.items.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in order" });
    }

    const item = order.items[itemIndex];

    // Calculate amount to subtract
    const itemAmount = item.product.offerPrice * item.quantity;
    const itemAmountWithTax = Math.floor(itemAmount + (itemAmount * 0.02));
    order.totalPrice -= itemAmountWithTax;

    item.itemOrderStatus = "Cancelled";
    item.itemPaymentStatus = "Cancelled";

    const allCancelled = order.items.every(i => i.itemOrderStatus === "Cancelled");
    order.orderStatus = allCancelled ? "Cancelled" : "Placed";



    if (order.orderStatus === "Cancelled") {
      order.totalPrice = 0;
      mailSender(userEmail, "Order Cancelled", `<h1>Your Order with id ${orderId} is cancelled...</h1>`);
    }

    await order.save();

    return res.status(200).json({ success: true, message: "Item cancelled", order });
  } catch (error) {
    console.error("Cancel Order Item Error:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel order item", error: error.message });
  }
};

const updateOrderItemStatusByAdmin = async (req, res) => {
  const { orderId, productId, newStatus } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find the specific item in the order
    const item = order.items.find(i => i.product._id.toString() === productId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in this order",
      });
    }

    item.itemOrderStatus = newStatus;

    if(newStatus === "Delivered"){
      item.itemDeliveryDate = new Date();
    }

    if(item.itemOrderStatus === "Delivered"){
      item.itemPaymentStatus = "Paid";
    }

    const nonCancelledItems = order.items.filter(i => i.itemOrderStatus !== "Cancelled");
    const allDelivered = nonCancelledItems.length > 0 && nonCancelledItems.every(i => i.itemOrderStatus === "Delivered");

    order.orderStatus = allDelivered ? "Delivered" : "Placed";


    await order.save();

    res.status(200).json({
      success: true,
      message: "Item order status updated",
      updatedItem: item,
    });
  } catch (error) {
    console.error("Error updating order item status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update item order status",
    });
  }
};

// const deleteOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     const order = await Order.findByIdAndDelete(orderId);

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     return res.status(200).json({ success: true, message: "Order deleted successfully" });
//   } catch (error) {
//     console.error("Delete Order Error:", error);
//     return res.status(500).json({ success: false, message: "Failed to delete order" });
//   }
// };


module.exports = {
  createOrder,
  getUserOrders,
  cancelOrderItem,
  getAllUsers,
  getOrdersByUserId,
  cancelOrderItemByAdmin,
  updateOrderItemStatusByAdmin,
  verifyPayment
};