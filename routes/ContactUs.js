const express = require("express");
const router = express.Router();

const contactUsController = require("../controllers/ContactUs");
const { authMiddleware, isUser } = require("../middlewares/Auth");

// Just `/` here since prefix is already handled in index.js
router.post("/contact-us", authMiddleware, isUser, contactUsController);

module.exports = router;