const mongoose = require('mongoose');

const contactUs = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      message: {
        type: String,
        required: true,
        minlength: 10,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    { timestamps: true }
)

module.exports = mongoose.model("ContactUs", contactUs);