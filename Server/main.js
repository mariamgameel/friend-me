require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); 
const helmet = require("helmet");
const path = require("path");
const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const sanitize = require("./middlewares/sanitize");
const { generalLimiter } = require("./middlewares/rateLimiter");

async function dbconnection(){
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
    } catch(error) {
        console.log(error);
    }
}
dbconnection();

const main = express();

main.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

main.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
})); 

main.use(express.json({ limit: "10kb" }));
main.use(cookieParser());
main.use(sanitize);
main.use(generalLimiter);

// Serve static uploads
const uploadDir = path.resolve(__dirname, process.env.UPLOAD_DIR || "uploads");
main.use("/uploads", express.static(uploadDir));

// API Routes
main.use("/api/dogs", require("./routes/dogRoutes"));
main.use("/api/users", require("./routes/userRoutes"));
main.use("/api/adoptions", require("./routes/adoptionRoutes"));
main.use("/api/products", require("./routes/productRoutes"));
main.use("/api/orders", require("./routes/orderRoutes"));
main.use("/api/contact", require("./routes/contactRoutes"));
main.use("/api/admin", require("./routes/statsRoutes"));
main.use("/api/uploads", require("./routes/uploadRoutes"));

main.use(notFound);
main.use(errorHandler);

const port = process.env.PORT || 3000;
main.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});