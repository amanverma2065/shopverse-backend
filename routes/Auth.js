const express = require("express");
const router = express.Router();
const { signup, login, logout, changePassword, sendOtp } = require("../controllers/Auth");
// const { authMiddleware, isAdmin, isUser} = require("../middlewares/Auth");
const { authMiddleware } = require("../middlewares/Auth");
const { resetPasswordToken, resetPassword } = require("../controllers/ResetPassword");


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/sendotp", sendOtp);
router.post("/changepassword", authMiddleware, changePassword);


//Reset Password

// Route for generating a reset password token
router.post("/resetPasswordToken", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/resetPassword", resetPassword)

module.exports = router;