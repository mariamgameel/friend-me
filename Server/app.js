const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const sanitize = require("./middlewares/sanitize");
const { generalLimiter } = require("./middlewares/rateLimiter");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(sanitize);

// In test environment, skip rate limiter to prevent 429 during test suites
if (process.env.NODE_ENV !== "test") {
  app.use(generalLimiter);
}

// Serve static uploads
const uploadDir = path.resolve(__dirname, process.env.UPLOAD_DIR || "uploads");
app.use("/uploads", express.static(uploadDir));

// API Routes
app.use("/api/dogs", require("./routes/dogRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/adoptions", require("./routes/adoptionRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/admin", require("./routes/statsRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
