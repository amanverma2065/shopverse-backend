const User = require("../models/User");
const mailSender = require("../utils/mailsender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Request to reset password (generate a token)
const resetPasswordToken = async (req, res) => {
    try {
        console.log("resetPasswordToken function triggered");
        const email = req.body.email;
        const user = await User.findOne({ email: email });
        console.log("User found:", user);
        console.log("Email received:", email);  

        if (!user) {
            return res.json({
                success: false,
                message: `This email: ${email} is not registered with us. Please enter a valid email.`
            });
        }

        // Generate a unique token
        const token = crypto.randomBytes(20).toString("hex");
        console.log("Generated token:", token); 

        // Update user with token and expiration time (1 hour)
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                resetPasswordToken: token,
                resetPasswordExpires: Date.now() + 5*60*1000,
            },
            { new: true }
        );

        console.log("Details:", updatedDetails);

        // Password reset URL
        const url = `https://yourapp.com/reset-password/${token}`;

        // Send email to user with the reset link
        await mailSender(
            email,
            "Password Reset Request",
            `You have requested a password reset. Please click the following link to reset your password: ${url}`
        );

        res.json({
            success: true,
            message: "Email sent successfully. Please check your inbox to continue.",
        });
    } catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: "Error sending the reset email.",
        });
    }
};

// Reset password after clicking the link
const resetPassword = async (req, res) => {
    try {
        console.log("resetPassword function triggered");
        const { password, confirmPassword, token } = req.body;

        if (confirmPassword !== password) {
            return res.json({
                success: false,
                message: "Password and confirm password do not match.",
            });
        }

        const userDetails = await User.findOne({  resetPasswordToken: token });
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is invalid.",
            });
        }

        // Check if the token has expired
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(403).json({
                success: false,
                message: "Token has expired. Please regenerate your reset token.",
            });
        }

        // Encrypt the new password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Update the user password in the database
        await User.findOneAndUpdate(
            { resetPasswordToken: token },
            { password: encryptedPassword },
            { new: true }
        );

        res.json({
            success: true,
            message: "Password reset successful.",
        });
    } catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: "Error updating the password.",
        });
    }
};

module.exports = {
    resetPasswordToken,
    resetPassword
}