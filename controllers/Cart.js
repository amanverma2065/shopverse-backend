const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add Product to Cart

const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(404).json({ success: false, message: "User Login Required!" });
        }

        if (!productId || !quantity) {
            return res.status(400).json({ success: false, message: "Product name and quantity are required" });
        }

        // const product = await Product.findOne({ name: productName });
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [{ product: product._id, quantity }],
            });
        } else {
            const productIndex = cart.items.findIndex(item => item.product.toString() === product._id.toString());
            if (productIndex > -1) {
                cart.items[productIndex].quantity += quantity;
            } else {
                cart.items.push({ product: product._id, quantity });
            }
        }

        //  Update totalItems and totalPrice
        cart.totalItems = cart.items.length;

        let total = 0;
        for (const item of cart.items) {
            const prod = await Product.findById(item.product);
            total += prod.offerPrice * item.quantity;
        }
        cart.totalPrice = total;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error adding product to cart",
            error: error.message,
        });
    }
};


const decreaseCartQuantity = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const productIndex = cart.items.findIndex(item => item.product.toString() === productId.toString());

        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: "Product not found in cart" });
        }

        // Decrease quantity or remove item
        if (cart.items[productIndex].quantity > 1) {
            cart.items[productIndex].quantity -= 1;
        } else {
            cart.items.splice(productIndex, 1); // remove product from cart
        }

        // Recalculate totals
        cart.totalItems = cart.items.length;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product quantity decreased successfully",
            cart,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error decreasing product quantity",
            error: error.message,
        });
    }
};



const getCartAmount = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        let totalAmount = 0;

        for (const item of cart.items) {
            const product = await Product.findById(item.product);
            if (product) {
                totalAmount += (product.offerPrice) * item.quantity;
            }
        }

        return res.status(200).json({
            success: true,
            totalAmount
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error calculating total cart amount",
            error: error.message,
        });
    }
};



// Remove Product from Cart (by product name)
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product Id is required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        // const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.product.toString() !== product._id.toString());

        cart.totalItems = cart.items.length;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart successfully",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error removing product from cart",
            error: error.message,
        });
    }
};

// Update Product Quantity in Cart (by product name)
const updateCartQuantity = async (req, res) => {
    try {
        const { productName, quantity } = req.body;
        const userId = req.user.id;

        if (!productName || !quantity) {
            return res.status(400).json({ success: false, message: "Product name and quantity are required" });
        }

        const product = await Product.findOne({ name: productName });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const productId = product._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const productIndex = cart.items.findIndex(item => item.product.toString() === productId.toString());
        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: "Product not found in the cart" });
        }

        cart.items[productIndex].quantity = quantity;
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product quantity updated successfully",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating cart quantity",
            error: error.message,
        });
    }
};

const getCartQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        // Calculate total quantity
        const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

        return res.status(200).json({
            success: true,
            totalQuantity,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching total cart quantity",
            error: error.message,
        });
    }
};


// View Cart
const viewCart = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user is authenticated

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        return res.status(200).json({
            success: true,
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching cart",
            error: error.message,
        });
    }
};

// Clear Cart
// const clearCart = async (req, res) => {
//     try {
//         const userId = req.user.id; // Assuming user is authenticated

//         // Find the user's cart and clear it
//         const cart = await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { new: true });
//         if (!cart) {
//             return res.status(404).json({ success: false, message: "Cart not found" });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Cart cleared successfully",
//             cart,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Error clearing the cart",
//             error: error.message,
//         });
//     }
// };

module.exports = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    viewCart,
    getCartQuantity,
    getCartAmount,
    decreaseCartQuantity
}