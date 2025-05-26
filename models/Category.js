const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    products: [
        { type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product' 
        }
    ], // This will hold product IDs
});

module.exports = mongoose.model("Category", categorySchema);