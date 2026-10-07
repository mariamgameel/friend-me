const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    let token = req.cookies?.token;

    if (!token) {
        const authHeader = req.header("Authorization");
        token = authHeader && authHeader.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access Denied: No token provided"
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        const message = error.name === "TokenExpiredError" ? "Session expired" : "Invalid Token";
        res.status(401).json({
            success: false,
            message
        });
    }
};

module.exports = auth;