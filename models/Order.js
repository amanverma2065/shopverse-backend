const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      itemOrderStatus: {
        type: String,
        enum: ["Placed", "Shipped", "Delivered", "Cancelled"],
        default: "Placed",
      },
      itemPaymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Cancelled", "Failed"],
        default: "Pending",
      },
      itemDeliveryDate: {
        type: Date,
      },
    }
  ],
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentType: {
    type: String,
    enum: ["COD", "Online"],
    default: "COD",
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Cancelled", "Failed"],
    default: "Pending",
  },
  orderStatus: {
    type: String,
    enum: ["Placed", "Shipped", "Delivered", "Cancelled"],
    default: "Placed",
  },
  razorpayDetails: {
    razorpay_order_id: { type: String },        // razorpay_order_id
    razorpay_payment_id: { type: String },      // razorpay_payment_id
    razorpay_signature: { type: String },       // razorpay_signature
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
