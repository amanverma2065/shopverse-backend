const Address = require("../models/Address");

// Add Address: POST /api/address/add
const addAddress = async (req, res) => {
    try {
        const { firstName, lastName, email, street, city, state, phone } = req.body;
        const userId = req.user.id;

        // Check if all required fields are present
        if (!firstName || !lastName || !email || !street || !city || !state || !phone) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Create new address
        const address = await Address.create({
            userId,
            firstName,
            lastName,
            email,
            street,
            city,
            state,
            phone,
        });

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            address,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add address",
            error: error.message,
        });
    }
};


// Get Address: POST /api/address/get
const getAddress = async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        return res.json({ success: false, message: "User Login is required" });
    }

    try {
        const addresses = await Address.find({ userId });
        res.json({ success: true, addresses });
    } catch (error) {
        console.log("Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};


// Delete Address: DELETE /api/address/delete/:id
const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User Login is required" });
        }

        const address = await Address.findOneAndDelete({ _id: addressId, userId });

        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found or unauthorized" });
        }

        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting address:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to delete address",
            error: error.message,
        });
    }
};


// Update Address: PUT /api/address/update/:id

// const updateAddress = async (req, res) => {
//     try {
//         const { id } = req.params;        // address ID from URL
//         const { userId, fullName, phone, street, city, state, pincode, country } = req.body;

//         if (!userId) {
//             return res.status(400).json({ success: false, message: "User ID is required" });
//         }

//         const updatedAddress = await Address.findOneAndUpdate(
//             { _id: id, userId }, // ensure user owns this address
//             { fullName, phone, street, city, state, pincode, country },
//             { new: true }
//         );

//         if (!updatedAddress) {
//             return res.status(404).json({ success: false, message: "Address not found or unauthorized" });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Address updated successfully",
//             address: updatedAddress,
//         });
//     } catch (error) {
//         console.error("Update Error:", error.message);
//         res.status(500).json({
//             success: false,
//             message: "Failed to update address",
//             error: error.message,
//         });
//     }
// };

module.exports = {
    addAddress,
    getAddress,
    deleteAddress
}