const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const auth = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/roleMiddleware");
const AppError = require("../utils/AppError");

const uploadDir = path.resolve(__dirname, "..", process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${crypto.randomUUID()}${ext}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError("Only JPEG, PNG, and WebP images are allowed", 400), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 } // 3 MB
});

router.post("/", auth, isAdmin, upload.single("image"), (req, res, next) => {
    if (!req.file) {
        return next(new AppError("No image file provided", 400));
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
        success: true,
        url: fileUrl,
        data: { url: fileUrl }
    });
});

module.exports = router;
