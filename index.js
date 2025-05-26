const express = require("express");
const app = express();
const authRouter = require("./routes/Auth");
const categoryRouter = require("./routes/CategoryRoute");
const productRouter = require("./routes/ProductRoutes");
const cartRouter = require("./routes/CartRoutes");
const contactUsRouter = require("./routes/ContactUs");
const addressRouter = require("./routes/Address");
const orderRouter = require("./routes/Order");
const resetOtpRouter = require("./routes/ResetOtp");
const cors = require('cors');
require("dotenv").config();
const cookieParser = require('cookie-parser');


const dbConnect = require("./config/database");

const PORT = process.env.PORT || 9000;

// ✅ Apply middleware before routes
app.use(cors({
  origin: 'https://shopverse-frontend.vercel.app', // React app origin
  credentials: true,               // Needed if using cookies, sessions, etc.
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json()); // Parse incoming JSON
const fileUploadMiddleware = require("express-fileupload");
app.use(fileUploadMiddleware({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// ✅ Connect to DB before handling routes
dbConnect();

// Connect with cloudinary

const cloudinary = require("./config/cloudinary");
cloudinary();

app.use(cookieParser());

// ✅ Now define routes
app.use("/api/auth", authRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/contactUs", contactUsRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/reset-password", resetOtpRouter);

app.get("/", (req, res) => {
  res.send(`<h1>This is homepage</h1>`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
