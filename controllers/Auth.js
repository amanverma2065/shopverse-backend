const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/Otp");
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailsender")
require("dotenv").config();

const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, accountType, otp } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match. Please try again.",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            });
        }

        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (response.length === 0 || otp !== response[0].otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
        });

        return res.status(201).json({
            success: true,
            user,
            message: "User registered successfully.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again.",
            error: error.message,
        });
    }
};


// login

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const user = await User.findOne({ email });
        console.log("User", user);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered",
            });
        }

        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

            const userData = user.toObject();
            userData.token = token;
            userData.password = undefined;

            // setting up a cookie
            const cookieOptions = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: true,
                // secure: process.env.NODE_ENV === "production",
                sameSite:  "None",
                // sameSite:  process.env.NODE_ENV === "production" ? "none" : "strict",
            };

            // const cookieOptions = {
            //     expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            //     httpOnly: true,
            //     secure: false,
            //     // secure: process.env.NODE_ENV === "production",
            //     sameSite:  "strict",
            //     // sameSite:  process.env.NODE_ENV === "production" ? "none" : "strict",
            // };

            res.cookie("token", token, cookieOptions).status(200).json({
                success: true,
                token,
                userData,
                message: "User Login Success....",
            })

            console.log("Userdata :", userData);
            // console.log("Res", res.data);
        }
        else {

            return res.status(401).json({
                success: false,
                message: "Password Incorrect....."
            })
        }
    } catch (error) {
        console.log("Login Fail", error);
        return res.status(500).json({
            success: false,
            message: "Login fail.......",
        })
    }
}

// logout

const logout = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:  process.env.NODE_ENV === "production" ? "none" : "strict",

        }).json({
            success: true,
            message: "Logged out successfully...",
        })
    } catch (error) {
        console.log(error.message);
        return res.json({
            success: false,
            message: error.message,
        })
    }
}

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(409).json({
                success: false,
                message: "User is already registered.",
            });
        }

        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        let result = await OTP.findOne({ otp });
        while (result) {
            otp = otpGenerator.generate(6, { upperCaseAlphabets: false });
            result = await OTP.findOne({ otp });
        }

        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);

        console.log("OTP sent successfully:", otpBody);
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
            otp,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP. Please try again.",
            error: error.message,
        });
    }
};

const changePassword = async (req, res) => {
    try {
      const userDetails = await User.findById(req.user.id);
      const { oldPassword, newPassword } = req.body;
  
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Old password and new password are required.",
        });
      }
  
      const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Old password is incorrect.",
        });
      }
  
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      );
  
      try {
        await mailSender(
          updatedUserDetails.email,
          "Password updated for your account",
          `<h1>Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName} </h1>`
        );
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        return res.status(500).json({
          success: false,
          message: "Password updated, but error sending email notification.",
          error: emailError.message,
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Password updated successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to update password. Please try again later.",
        error: error.message,
      });
    }
  };


module.exports = { signup, login, logout, sendOtp, changePassword };