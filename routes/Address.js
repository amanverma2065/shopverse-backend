const express = require("express");
const router = express.Router();
const {
    addAddress,
    getAddress,
    deleteAddress
} = require("../controllers/Address");
const { authMiddleware } = require("../middlewares/Auth"); // including both isAdmin and isCustomer


router.post("/addAddress", authMiddleware, addAddress);              
router.delete("/deleteAddress", authMiddleware, deleteAddress);    
// router.put("/updateToCart", authMiddleware, updateCartQuantity); 
router.get("/getAddress", authMiddleware, getAddress);              


module.exports = router;