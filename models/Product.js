const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    description: { 
        type: String, 
        required: true
    },
    price: { 
        type: Number, 
        required: true 
    },
    offerPrice: {
        type: Number, 
        required: true
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    stock: { 
        type: Number, 
        required: true 
    }
    
});


module.exports = mongoose.model("Product", productSchema);