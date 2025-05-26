const contactResponseTemplate = require("../mail/contactResponseTemplate");
const contactAdminTemplate = require("../mail/contactAdminTemplate");
const mailSender = require("../utils/mailsender");
// const ContactUs = require("../models/ContactUs");

const contactUsController = async (req, res) => {
    const {  userName, email, queryType,  message } = req.body
    console.log(req.body)
    try {
        const emailRes = await mailSender(
            email,
            "Contact Form Submitted",
            contactResponseTemplate({ userName, queryType })
        )
        await mailSender(
            "manigupta.mg21@gmail.com",
            `New Request from ${userName}`,
            contactAdminTemplate({ email, userName,queryType, message })
        )
        console.log("Email Res ", emailRes)

        // const newRequest = new ContactUs({
        //     name: userName,
        //     email: email,
        //     message: message,
        // });

        // // Save the product
        // await newRequest.save();

        return res.json({
            success: true,
            message: "Email send successfully",
        })
    } catch (error) {
        console.log("Error", error)
        console.log("Error message :", error.message)
        return res.json({
            success: false,
            message: "Something went wrong...",
        })
    }
};

module.exports = contactUsController;